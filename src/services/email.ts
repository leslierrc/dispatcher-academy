import { resend, emailFrom } from "@/lib/resend";

function baseLayout(body: string) {
  return `
  <div style="background:#1a1817;color:#e8ddd5;font-family:Georgia,serif;padding:32px 0;">
    <div style="max-width:520px;margin:0 auto;background:#241f1e;border:1px solid rgba(232,221,213,0.1);border-radius:8px;overflow:hidden;">
      <div style="padding:28px 32px;border-bottom:1px solid rgba(232,221,213,0.1);">
        <span style="font-family:Georgia,serif;font-size:20px;letter-spacing:0.5px;">7 Digital LLC</span>
      </div>
      <div style="padding:28px 32px;font-size:15px;line-height:1.65;color:#e8ddd5;">
        ${body}
      </div>
      <div style="padding:20px 32px;border-top:1px solid rgba(232,221,213,0.1);font-size:12px;color:#979089;">
        7 Digital LLC
      </div>
    </div>
  </div>`;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) return { ok: false, skipped: true };
  return resend.emails.send({ from: emailFrom, to, subject, html });
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "¡Bienvenido a 7 Digital LLC! 🎓",
    html: baseLayout(`
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:600;">¡Bienvenido${name ? ", " + name : ""}!</h2>
      <p>Tu cuenta ha sido creada correctamente. Ya puedes acceder a tu dashboard y comenzar tu formación como dispatcher.</p>
      <p style="margin:20px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#a8727a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;">Ir a mi dashboard</a>
      </p>
      <p style="color:#979089;font-size:13px;">Si no creaste esta cuenta, ignora este correo.</p>
    `),
  });
}

export async function sendPurchaseSuccessEmail(to: string, name: string, planName: string) {
  return sendEmail({
    to,
    subject: `¡Pago exitoso! Plan ${planName} 🎉`,
    html: baseLayout(`
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:600;">¡Pago confirmado!</h2>
      <p>${name ? "Hola " + name + "," : "Hola,"} tu compra del plan <strong>${planName}</strong> fue procesada con éxito.</p>
      <p>Ya tienes acceso completo a tu curso. ¡A por tu nueva carrera como dispatcher!</p>
      <p style="margin:20px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background:#a8727a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;">Comenzar mi curso</a>
      </p>
    `),
  });
}

export async function sendPurchaseFailedEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Hubo un problema con tu pago",
    html: baseLayout(`
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:600;">Pago no completado</h2>
      <p>${name ? "Hola " + name + "," : "Hola,"} no pudimos procesar tu pago. No te preocupes: puedes reintentar cuando quieras.</p>
      <p style="margin:20px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/#precios" style="background:#a8727a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;">Ver planes</a>
      </p>
      <p style="color:#979089;font-size:13px;">Si el problema persiste, respóndenos este correo y te ayudamos.</p>
    `),
  });
}

export async function sendResetPasswordEmail(to: string, resetLink: string) {
  return sendEmail({
    to,
    subject: "Recupera tu contraseña",
    html: baseLayout(`
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-weight:600;">Restablece tu contraseña</h2>
      <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente enlace (válido por 30 minutos):</p>
      <p style="margin:20px 0;">
        <a href="${resetLink}" style="background:#a8727a;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;display:inline-block;">Restablecer contraseña</a>
      </p>
      <p style="color:#979089;font-size:13px;">Si no solicitaste esto, ignora este correo.</p>
    `),
  });
}
