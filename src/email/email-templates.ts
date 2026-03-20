import { NotificationType } from '@prisma/client';

export interface TemplateData {
  email?: string;
  name?: string;
  blockedUntil?: string;
  failedAttempts?: number;
  reason?: string;
  bannedUntil?: string | null;
  daysRemaining?: number;
  resetToken?: string;
  resetUrl?: string;
  verificationUrl?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export interface TemplateOutput {
  subject: string;
  html: string;
  text: string;
}

const generateHtmlTemplate = (title: string, body: string, footer: string): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">App Finance</h1>
  </div>
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">${title}</h2>
    ${body}
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
      ${footer}
    </div>
  </div>
</body>
</html>
`;
};

const generateTextTemplate = (title: string, body: string, footer: string): string => {
  return `
${title.toUpperCase()}
${'='.repeat(title.length)}

${body}

---
${footer}
`;
};

export function getTemplate(type: NotificationType, data: TemplateData): TemplateOutput {
  switch (type) {
    case 'EMAIL_VERIFICATION': {
      const email = data.email || 'Usuario';
      const name = data.name || 'Usuario';
      const verificationUrl = data.verificationUrl || 'https://casadecambio.app/verify';
      const whatsappNumber = data.whatsappNumber || '53917705';
      const subject = '¡Bienvenido a Casa de Cambio! - Tu cuenta está pendiente de activar';
      const html = generateHtmlTemplate(
        subject,
        `
        <p style="color: #333; font-size: 16px;">¡Hola <strong>${name}</strong>!</p>
        <p style="color: #333; font-size: 16px;">Gracias por registrarte en <strong>Casa de Cambio</strong>.</p>
        
        <div style="background: #F0FDF4; border-left: 4px solid #22C55E; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #166534; margin-top: 0;">📋 Estado de tu cuenta</h3>
          <p style="color: #166534; font-size: 15px; margin-bottom: 0;">
            Tu cuenta ha sido <strong>registrada exitosamente</strong> pero aún no está activada.
          </p>
        </div>
        
        <h3 style="color: #333;">📱 Para activar tu cuenta</h3>
        <p style="color: #333; font-size: 15px;">
          Contacta con el administrador a través de WhatsApp para realizar el pago de tu suscripción:
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://wa.me/53${whatsappNumber}" style="background: #25D366; color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px;">
            💬 Escribir por WhatsApp
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          <strong>Número:</strong> +53 ${whatsappNumber}
        </p>
        
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <p style="color: #92400E; font-size: 14px; margin: 0;">
            <strong>⏳ Importante:</strong> Tu cuenta se activará una vez confirmado el pago. Recibirás la cantidad de meses correspondientes a tu plan.
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        `,
        '© 2026 Casa de Cambio. Este correo fue enviado automáticamente.'
      );
      const text = generateTextTemplate(
        subject,
        `¡Hola ${name}!

Gracias por registrarte en Casa de Cambio.

Tu cuenta ha sido REGISTRADA EXITOSAMENTE pero aún no está activada.

=== PARA ACTIVAR TU CUENTA ===

Contacta con el administrador a través de WhatsApp para realizar el pago:

📱 WhatsApp: +53 ${whatsappNumber}
🔗 Link: https://wa.me/53${whatsappNumber}

⏳ IMPORTANTE: Tu cuenta se activará una vez confirmado el pago. Recibirás la cantidad de meses correspondientes a tu plan.

Si tienes alguna pregunta, no dudes en contactarnos.`,
        '© 2026 Casa de Cambio. Este correo fue enviado automáticamente.'
      );
      return { subject, html, text };
    }

    case 'NEW_USER_REGISTERED': {
      const email = data.email || 'Usuario';
      const subject = 'Bienvenido a App Finance';
      const html = generateHtmlTemplate(
        subject,
        `
        <p>Hola <strong>${email}</strong>,</p>
        <p>Tu cuenta en App Finance ha sido creada exitosamente.</p>
        <p>Ahora puedes acceder al sistema con tus credenciales.</p>
        <p>Si tienes alguna pregunta, no dudes en contactar al administrador.</p>
        `,
        '© 2024 App Finance. Todos los derechos reservados.'
      );
      const text = generateTextTemplate(
        subject,
        `Hola ${email},

Tu cuenta en App Finance ha sido creada exitosamente.

Ahora puedes acceder al sistema con tus credenciales.

Si tienes alguna pregunta, no dudes en contactar al administrador.`,
        '© 2024 App Finance. Todos los derechos reservados.'
      );
      return { subject, html, text };
    }

    case 'USER_TEMP_BLOCKED': {
      const email = data.email || 'Usuario';
      const blockedUntil = data.blockedUntil || 'desconocida';
      const failedAttempts = data.failedAttempts || 0;
      const subject = 'Tu cuenta ha sido bloqueada temporalmente';
      const html = generateHtmlTemplate(
        subject,
        `
        <p>Hola <strong>${email}</strong>,</p>
        <p>Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos de inicio de sesión fallidos.</p>
        <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
          <strong>Detalles:</strong><br>
          Intentos fallidos: ${failedAttempts}<br>
          Bloqueado hasta: ${blockedUntil}
        </p>
        <p>Por favor, espera hasta la hora indicada para intentar iniciar sesión nuevamente.</p>
        `,
        '© 2024 App Finance. Si no reconoces esta actividad, contacta al administrador.'
      );
      const text = generateTextTemplate(
        subject,
        `Hola ${email},

Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos de inicio de sesión fallidos.

Detalles:
- Intentos fallidos: ${failedAttempts}
- Bloqueado hasta: ${blockedUntil}

Por favor, espera hasta la hora indicada para intentar iniciar sesión nuevamente.`,
        '© 2024 App Finance. Si no reconoces esta actividad, contacta al administrador.'
      );
      return { subject, html, text };
    }

    case 'USER_BANNED': {
      const email = data.email || 'Usuario';
      const reason = data.reason || 'No especificada';
      const bannedUntil = data.bannedUntil || 'Permanente';
      const subject = 'Tu cuenta ha sido suspendida';
      const html = generateHtmlTemplate(
        subject,
        `
        <p>Hola <strong>${email}</strong>,</p>
        <p>Tu cuenta en App Finance ha sido suspendida.</p>
        <p style="background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
          <strong>Motivo:</strong> ${reason}<br>
          <strong>Suspensión:</strong> ${bannedUntil === 'Permanente' ? 'Permanente' : `Hasta: ${bannedUntil}`}
        </p>
        <p>Si crees que esto es un error, contacta al administrador del sistema.</p>
        `,
        '© 2024 App Finance. Para apelaciones, contacta al soporte.'
      );
      const text = generateTextTemplate(
        subject,
        `Hola ${email},

Tu cuenta en App Finance ha sido suspendida.

Motivo: ${reason}
Suspensión: ${bannedUntil === 'Permanente' ? 'Permanente' : `Hasta: ${bannedUntil}`}

Si crees que esto es un error, contacta al administrador del sistema.`,
        '© 2024 App Finance. Para apelaciones, contacta al soporte.'
      );
      return { subject, html, text };
    }

    case 'LICENSE_EXPIRING': {
      const email = data.email || 'Usuario';
      const daysRemaining = data.daysRemaining || 7;
      const subject = `Tu licencia expira en ${daysRemaining} días`;
      const html = generateHtmlTemplate(
        subject,
        `
        <p>Hola <strong>${email}</strong>,</p>
        <p>Tu licencia de App Finance está por expirar.</p>
        <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
          <strong>Días restantes:</strong> ${daysRemaining}
        </p>
        <p>Por favor, renueva tu licencia para continuar disfrutando de todos los servicios sin interrupción.</p>
        <p>Contacta al administrador para más información sobre las opciones de renovación.</p>
        `,
        '© 2024 App Finance. No dejes que tu licencia expire.'
      );
      const text = generateTextTemplate(
        subject,
        `Hola ${email},

Tu licencia de App Finance está por expirar.

Días restantes: ${daysRemaining}

Por favor, renueva tu licencia para continuar disfrutando de todos los servicios sin interrupción.

Contacta al administrador para más información sobre las opciones de renovación.`,
        '© 2024 App Finance. No dejes que tu licencia expire.'
      );
      return { subject, html, text };
    }

    case 'PASSWORD_RESET': {
      const email = data.email || 'Usuario';
      const resetToken = data.resetToken || 'TOKEN';
      const resetUrl = data.resetUrl || `https://appfinance.com/reset-password?token=${resetToken}`;
      const subject = 'Restablece tu contraseña';
      const html = generateHtmlTemplate(
        subject,
        `
        <p>Hola <strong>${email}</strong>,</p>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
        </div>
        <p style="color: #666; font-size: 12px;">Este enlace expirará en 1 hora.</p>
        <p style="color: #666; font-size: 12px;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        `,
        '© 2024 App Finance. Este correo fue enviado automáticamente, por favor no responder.'
      );
      const text = generateTextTemplate(
        subject,
        `Hola ${email},

Has solicitado restablecer tu contraseña.

Para crear una nueva contraseña, visita:
${resetUrl}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, puedes ignorar este correo.`,
        '© 2024 App Finance. Este correo fue enviado automáticamente, por favor no responder.'
      );
      return { subject, html, text };
    }

    default: {
      const subject = 'Notificación de App Finance';
      const html = generateHtmlTemplate(
        subject,
        `<p>Has recibido una notificación de App Finance.</p>`,
        '© 2024 App Finance.'
      );
      const text = generateTextTemplate(
        subject,
        'Has recibido una notificación de App Finance.',
        '© 2024 App Finance.'
      );
      return { subject, html, text };
    }
  }
}
