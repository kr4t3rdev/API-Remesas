import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

/**
 * Script de prueba para verificar configuración SMTP
 * Uso: npx ts-node scripts/test-smtp.ts
 */

async function testSMTP() {
  console.log('🧪 Probando configuración SMTP...\n');

  const configService = new ConfigService({
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'App Finance',
  });

  const host = configService.get<string>('SMTP_HOST');
  const port = configService.get<string>('SMTP_PORT');
  const user = configService.get<string>('SMTP_USER');
  const password = configService.get<string>('SMTP_PASSWORD');
  const from = configService.get<string>('SMTP_FROM');

  console.log('📧 Configuración:');
  console.log(`  Host: ${host}`);
  console.log(`  Puerto: ${port}`);
  console.log(`  Usuario: ${user}`);
  console.log(`  From: ${from}`);
  console.log('');

  if (!user || !password) {
    console.error('❌ ERROR: Faltan SMTP_USER o SMTP_PASSWORD');
    console.log('\n📝 Configura las variables de entorno:');
    console.log('   export SMTP_USER="tu-email@gmail.com"');
    console.log('   export SMTP_PASSWORD="tu-app-password"');
    process.exit(1);
  }

  // Crear transporter
  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(port || '587', 10),
    secure: parseInt(port || '587', 10) === 465,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 10000,
  });

  // Verificar conexión
  console.log('🔗 Verificando conexión con servidor SMTP...');
  
  try {
    await transporter.verify();
    console.log('✅ Conexión exitosa!\n');
  } catch (error) {
    console.error('❌ Error de conexión:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  // Enviar email de prueba
  console.log('📤 Enviando email de prueba...');

  const testEmail = process.argv[2] || user;

  try {
    const info = await transporter.sendMail({
      from: `"App Finance" <${from}>`,
      to: testEmail,
      subject: '✅ Prueba de SMTP - App Finance',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px;">
            <h1 style="color: white; margin: 0;">App Finance</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
            <h2>✅ Prueba de SMTP exitosa!</h2>
            <p>Si recibes este email, la configuración de SMTP está funcionando correctamente.</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </body>
        </html>
      `,
      text: `Prueba de SMTP exitosa!\n\nSi recibes este email, la configuración está funcionando.\n\nFecha: ${new Date().toLocaleString()}`,
    });

    console.log('✅ Email enviado exitosamente!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Enviado a: ${testEmail}`);
    console.log('');
    console.log('🎉 La configuración SMTP está funcionando correctamente!');
  } catch (error) {
    console.error('❌ Error al enviar email:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testSMTP();
