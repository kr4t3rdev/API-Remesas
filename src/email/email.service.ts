import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto, EmailResult } from './dto/email.dto';

/**
 * EmailService - Servicio de envío de correos electrónicos.
 * 
 * Utiliza Nodemailer para enviar emails via SMTP.
 * La configuración se obtiene de variables de entorno:
 * - SMTP_HOST: Servidor SMTP
 * - SMTP_PORT: Puerto SMTP (default: 587)
 * - SMTP_USER: Usuario de autenticación
 * - SMTP_PASSWORD: Contraseña de autenticación
 * - SMTP_FROM: Email del remitente
 * - SMTP_FROM_NAME: Nombre del remitente
 * 
 * El servicio maneja errores gracefulmente y no lanza excepciones.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter | null;
  private readonly fromAddress: string;
  private readonly fromName: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const password = this.configService.get<string>('SMTP_PASSWORD');
    this.fromAddress = this.configService.get<string>('SMTP_FROM') || 'noreply@appfinance.com';
    this.fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'App Finance';

    if (!host || !user || !password) {
      this.logger.warn('SMTP not configured, email sending will be skipped');
      this.transporter = null;
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || '587', 10),
      secure: parseInt(port || '587', 10) === 465,
      auth: {
        user,
        pass: password,
      },
      connectionTimeout: 10000, // 10 seconds timeout
    });

    this.logger.log('EmailService initialized with SMTP configuration');
  }

  /**
   * Envía un correo electrónico.
   * 
   * @param dto - Datos del email a enviar (to, subject, html, text)
   * @returns Promise<EmailResult> con success=true si se envió, o success=false si falló
   * 
   * Comportamiento:
   * - Si SMTP no está configurado, retorna error sin lanzar excepción
   * - Valida formato del email antes de enviar
   * - Timeout de conexión: 10 segundos
   * - Maneja errores y retorna información de error en el resultado
   */
  async sendEmail(dto: SendEmailDto): Promise<EmailResult> {
    if (!this.isConfigured || !this.transporter) {
      this.logger.warn('SMTP not configured, skipping email send');
      return {
        success: false,
        error: 'SMTP not configured',
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.to)) {
      this.logger.warn(`Invalid email address: ${dto.to}`);
      return {
        success: false,
        error: 'Invalid email address format',
      };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
      });

      this.logger.log(`Email sent successfully to ${dto.to}, messageId: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${dto.to}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
