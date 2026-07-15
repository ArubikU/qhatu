/**
 * Qhatu branded email layout — bulletproof, table-based, inline styles.
 * Dark theme. Works in Gmail, Outlook, Apple Mail, mobile clients.
 *
 * Brand: #7B3FF2 primary · #4B17B6 deep · #0F0D17 carbon · #C8B6FF lavender
 */

const C = {
  bg:        '#0F0D17',
  card:      '#15121F',
  border:    '#2A2438',
  primary:   '#7B3FF2',
  deep:      '#4B17B6',
  lavender:  '#C8B6FF',
  white:     '#FFFFFF',
  muted:     '#9B95AB',
  faint:     '#6B6578',
} as const

const FONT = `'Poppins','Segoe UI',Roboto,Helvetica,Arial,sans-serif`
const FONT_BODY = `'Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif`

function assetBase(): string {
  return (process.env.EMAIL_ASSET_BASE || process.env.FRONTEND_URL || 'https://qhatu.app').replace(/\/$/, '')
}

/** Hidden preview text shown in the inbox list. */
function preheader(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;color:transparent;height:0;width:0;">${text}</div>`
}

/** Bulletproof pill button. */
export function button(label: string, url: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr>
      <td align="center" bgcolor="${C.primary}" style="border-radius:999px;background:linear-gradient(135deg,${C.primary},${C.deep});">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:14px 32px;font-family:${FONT};font-size:15px;font-weight:600;
                  color:${C.white};text-decoration:none;border-radius:999px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}

/** Big letter-spaced code box (OTP / security code). */
export function codeBox(code: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:8px 0 4px;">
        <div style="display:inline-block;background:${C.bg};border:1px solid ${C.border};border-radius:16px;
                    padding:20px 28px;font-family:${FONT};font-size:38px;font-weight:700;letter-spacing:10px;
                    color:${C.lavender};">
          ${code}
        </div>
      </td>
    </tr>
  </table>`
}

export function paragraph(html: string): string {
  return `<p style="margin:0 0 16px;font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.muted};">${html}</p>`
}

export function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-family:${FONT};font-size:22px;font-weight:700;color:${C.white};">${text}</h1>`
}

/** Small note block (security disclaimer / expiry). */
export function note(html: string): string {
  return `<p style="margin:16px 0 0;font-family:${FONT_BODY};font-size:12px;line-height:1.5;color:${C.faint};">${html}</p>`
}

interface LayoutOpts {
  title: string         // inbox subject mirror / preheader
  preview: string       // preview text
  body: string          // inner HTML (use heading/paragraph/button/codeBox)
}

/** Wrap content in the full branded email shell. */
export function layout({ title, preview, body }: LayoutOpts): string {
  const base = assetBase()
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${C.bg};">
  ${preheader(preview)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Header / logo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <a href="${base}" target="_blank" style="text-decoration:none;">
                <img src="${base}/logotipo.png" alt="Qhatu" height="84"
                     style="height:84px;width:auto;border:0;outline:none;display:block;">
              </a>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="max-width:480px;background-color:${C.card};border:1px solid ${C.border};border-radius:24px;">
          <tr>
            <td style="padding:32px 28px;">
              ${body}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td align="center" style="padding:24px 16px 0;">
              <p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:12px;color:${C.faint};">
                Qhatu — la red social anónima de tu universidad
              </p>
              <p style="margin:0;font-family:${FONT_BODY};font-size:11px;color:${C.faint};">
                100% anónimo · Nunca compartimos tu correo
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`
}

export const COLORS = C
