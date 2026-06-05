import { layout, heading, paragraph, button, codeBox, note, COLORS } from './layout'

export interface EmailMessage {
  subject: string
  html: string
  text: string
}

// ─── 1. OTP verification (registro / login con correo institucional) ──────────

export function otpEmail(otp: string): EmailMessage {
  return {
    subject: 'Tu código de acceso Qhatu',
    html: layout({
      title:   'Tu código de acceso',
      preview: `Tu código es ${otp} — válido por 15 minutos`,
      body: `
        ${heading('Verifica tu correo')}
        ${paragraph('Usa este código para entrar a Qhatu. Vence en <strong style="color:#C8B6FF;">15 minutos</strong>.')}
        ${codeBox(otp)}
        ${note('Si no solicitaste este código, ignora este correo. Nadie más puede usarlo.')}
      `,
    }),
    text: `Tu código de acceso Qhatu: ${otp}\nVálido por 15 minutos. Si no lo solicitaste, ignora este correo.`,
  }
}

// ─── 2. Welcome (tras primer ingreso) ─────────────────────────────────────────

export function welcomeEmail(nickname: string): EmailMessage {
  const url = (process.env.FRONTEND_URL ?? 'https://qhatu.app') + '/feed'
  return {
    subject: `Bienvenid@ a Qhatu, ${nickname}`,
    html: layout({
      title:   'Bienvenid@ a Qhatu',
      preview: `Tu identidad anónima es ${nickname}`,
      body: `
        ${heading('¡Ya eres parte de Qhatu!')}
        ${paragraph(`Tu identidad anónima en el campus es <strong style="color:#C8B6FF;">${nickname}</strong>. Nadie sabe quién eres detrás de ella.`)}
        ${paragraph('Comparte chismes, opiniones y encuestas con total anonimato. Reacciona, comenta y sigue lo que te interesa.')}
        <div style="margin:24px 0 4px;">${button('Ir a mi feed', url)}</div>
        ${note('Tu correo institucional solo se usó para verificar que perteneces a tu universidad. Lo guardamos cifrado y jamás se muestra.')}
      `,
    }),
    text: `¡Bienvenid@ a Qhatu! Tu identidad anónima es ${nickname}. Entra: ${url}`,
  }
}

// ─── 3. Login QR / nuevo dispositivo (el QR que se refresca) ───────────────────
// Email de confirmación cuando alguien intenta entrar escaneando el QR de login.

export function qrLoginEmail(params: { code: string; device?: string; expiresMin?: number }): EmailMessage {
  const { code, device = 'un dispositivo', expiresMin = 2 } = params
  return {
    subject: 'Confirma tu inicio de sesión en Qhatu',
    html: layout({
      title:   'Confirma tu inicio de sesión',
      preview: `Código ${code} — confirma el acceso desde ${device}`,
      body: `
        ${heading('Inicio de sesión con QR')}
        ${paragraph(`Alguien escaneó tu código QR para entrar desde <strong style="color:#C8B6FF;">${device}</strong>. Si fuiste tú, confirma con este código:`)}
        ${codeBox(code)}
        ${note(`El código QR se renueva cada pocos segundos por seguridad. Este código vence en ${expiresMin} minutos.<br><br><strong style="color:#C8B6FF;">¿No fuiste tú?</strong> No ingreses el código y cambia el acceso de tu cuenta de inmediato.`)}
      `,
    }),
    text: `Confirma tu inicio de sesión en Qhatu desde ${device}. Código: ${code} (vence en ${expiresMin} min). Si no fuiste tú, ignóralo.`,
  }
}

// ─── 4. Alerta de seguridad (nuevo login detectado) ───────────────────────────

export function securityAlertEmail(params: { when: string; device?: string; location?: string }): EmailMessage {
  const { when, device = 'dispositivo desconocido', location = 'ubicación desconocida' } = params
  const url = (process.env.FRONTEND_URL ?? 'https://qhatu.app') + '/profile'
  return {
    subject: 'Nuevo inicio de sesión en tu cuenta Qhatu',
    html: layout({
      title:   'Nuevo inicio de sesión',
      preview: `Acceso detectado: ${device} · ${when}`,
      body: `
        ${heading('Nuevo inicio de sesión')}
        ${paragraph('Detectamos un acceso a tu cuenta:')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
          ${row('Cuándo', when)}
          ${row('Dispositivo', device)}
          ${row('Ubicación', location)}
        </table>
        <div style="margin:24px 0 4px;">${button('Revisar mi cuenta', url)}</div>
        ${note('Si fuiste tú, no necesitas hacer nada. Si no reconoces este acceso, cierra todas las sesiones desde tu perfil.')}
      `,
    }),
    text: `Nuevo inicio de sesión en Qhatu. Cuándo: ${when}. Dispositivo: ${device}. Ubicación: ${location}. Revisa: ${url}`,
  }
}

// ─── 5. Cambio de correo institucional ────────────────────────────────────────

export function emailChangeEmail(otp: string): EmailMessage {
  return {
    subject: 'Confirma el cambio de tu correo Qhatu',
    html: layout({
      title:   'Confirma el cambio de correo',
      preview: `Código ${otp} para confirmar tu nuevo correo`,
      body: `
        ${heading('Confirma tu nuevo correo')}
        ${paragraph('Recibimos una solicitud para cambiar el correo institucional de tu cuenta. Ingresa este código para confirmar:')}
        ${codeBox(otp)}
        ${note('Si no solicitaste este cambio, ignora este correo y tu cuenta seguirá igual.')}
      `,
    }),
    text: `Confirma el cambio de correo Qhatu con el código: ${otp}. Si no lo solicitaste, ignóralo.`,
  }
}

// ─── 6. Eliminación de cuenta ─────────────────────────────────────────────────

export function accountDeletionEmail(confirmUrl: string): EmailMessage {
  return {
    subject: 'Confirma la eliminación de tu cuenta Qhatu',
    html: layout({
      title:   'Eliminar cuenta',
      preview: 'Confirma que quieres eliminar tu cuenta Qhatu',
      body: `
        ${heading('¿Eliminar tu cuenta?')}
        ${paragraph('Esto borrará tu identidad anónima, posts, reacciones y todo tu historial. <strong style="color:#C8B6FF;">No se puede deshacer.</strong>')}
        <div style="margin:24px 0 4px;">${button('Confirmar eliminación', confirmUrl)}</div>
        ${note('Si no solicitaste esto, ignora este correo. Tu cuenta no se tocará.')}
      `,
    }),
    text: `Confirma la eliminación de tu cuenta Qhatu: ${confirmUrl}. Si no lo solicitaste, ignóralo.`,
  }
}

// ─── helper ───────────────────────────────────────────────────────────────────

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:${COLORS.faint};width:110px;">${label}</td>
      <td style="padding:6px 0;font-family:'Inter',Arial,sans-serif;font-size:13px;color:${COLORS.white};">${value}</td>
    </tr>`
}
