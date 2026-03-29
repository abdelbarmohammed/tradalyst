import logging
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

from .models import CustomUser, PasswordResetToken

logger = logging.getLogger(__name__)

_LOGO_SVG = """<svg height="28" width="auto" viewBox="0 0 172.22 40.63" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto 32px;">
  <g>
    <g fill="#ffffff">
      <path d="M26.46,32.72V11.98h4.68v3.47h.22c.37-1.2,1.02-2.12,1.95-2.77.93-.65,1.99-.97,3.17-.97.27,0,.58.01.91.04.33.02.62.06.85.09v4.43c-.2-.06-.52-.12-.96-.17-.45-.05-.88-.07-1.32-.07-.89,0-1.69.19-2.4.58-.71.38-1.27.91-1.67,1.59-.4.67-.6,1.45-.6,2.33v12.21h-4.82Z"/>
      <path d="M46.98,33.15c-1.31,0-2.49-.24-3.54-.71-1.05-.48-1.88-1.18-2.49-2.11-.61-.93-.91-2.07-.91-3.43,0-1.18.22-2.15.66-2.91.44-.77,1.03-1.38,1.78-1.84.75-.46,1.59-.8,2.53-1.04.94-.23,1.92-.4,2.93-.5,1.2-.14,2.18-.25,2.93-.35.75-.1,1.31-.26,1.66-.48s.53-.57.53-1.04v-.09c0-.68-.14-1.26-.41-1.73-.27-.48-.68-.84-1.22-1.09-.54-.25-1.2-.38-2-.38s-1.5.12-2.09.37c-.59.25-1.07.57-1.44.96-.37.4-.64.82-.82,1.28l-4.47-.91c.41-1.22,1.04-2.24,1.89-3.03.85-.8,1.87-1.39,3.05-1.79,1.18-.4,2.46-.59,3.85-.59.98,0,1.96.11,2.96.34,1,.23,1.91.62,2.74,1.16s1.5,1.27,2,2.19c.51.92.76,2.07.76,3.45v13.86h-4.62v-2.86h-.19c-.31.58-.73,1.12-1.27,1.62s-1.21.9-2,1.21-1.74.45-2.83.45ZM48.23,29.57c1,0,1.86-.2,2.59-.59s1.29-.92,1.69-1.57c.4-.65.6-1.36.6-2.12v-2.45c-.16.12-.43.24-.81.35-.38.11-.8.21-1.26.3s-.92.16-1.37.22-.83.11-1.14.15c-.72.1-1.37.26-1.95.48-.58.22-1.04.54-1.36.94-.33.4-.49.92-.49,1.57,0,.59.15,1.09.45,1.49.3.4.72.71,1.24.92.53.21,1.13.32,1.81.32Z"/>
      <path d="M70.66,33.09c-1.63,0-3.1-.42-4.39-1.25s-2.31-2.05-3.05-3.65-1.11-3.53-1.11-5.81.38-4.25,1.14-5.84,1.79-2.79,3.08-3.61c1.29-.82,2.73-1.22,4.31-1.22,1.24,0,2.25.21,3.03.62s1.41.91,1.87,1.48.81,1.1,1.05,1.6h.2V5.07h4.82v27.65h-4.73v-3.28h-.3c-.25.5-.61,1.03-1.09,1.6-.48.57-1.1,1.05-1.88,1.46-.78.4-1.77.6-2.97.6ZM71.98,29.12c1.05,0,1.94-.28,2.67-.84.73-.56,1.29-1.35,1.67-2.37.38-1.01.58-2.2.58-3.54s-.19-2.52-.57-3.52c-.38-1-.93-1.77-1.67-2.33-.74-.56-1.63-.84-2.68-.84s-2,.29-2.73.86c-.73.57-1.28,1.37-1.65,2.38s-.56,2.16-.56,3.44.19,2.44.56,3.46.92,1.82,1.66,2.41,1.64.88,2.72.88Z"/>
      <path d="M92.52,33.15c-1.31,0-2.49-.24-3.54-.71-1.05-.48-1.88-1.18-2.49-2.11-.61-.93-.91-2.07-.91-3.43,0-1.18.22-2.15.66-2.91.44-.77,1.03-1.38,1.78-1.84.75-.46,1.59-.8,2.53-1.04.94-.23,1.92-.4,2.93-.5,1.2-.14,2.18-.25,2.93-.35.75-.1,1.31-.26,1.66-.48s.53-.57.53-1.04v-.09c0-.68-.14-1.26-.41-1.73-.27-.48-.68-.84-1.22-1.09-.54-.25-1.2-.38-2-.38s-1.5.12-2.09.37-1.07.57-1.44.96c-.37.4-.64.82-.82,1.28l-4.47-.91c.41-1.22,1.04-2.24,1.89-3.03.85-.8,1.87-1.39,3.05-1.79,1.18-.4,2.46-.59,3.85-.59.98,0,1.96.11,2.96.34,1,.23,1.91.62,2.74,1.16s1.5,1.27,2,2.19c.51.92.76,2.07.76,3.45v13.86h-4.62v-2.86h-.19c-.31.58-.73,1.12-1.27,1.62s-1.21.9-2,1.21-1.74.45-2.83.45ZM93.76,29.57c1,0,1.86-.2,2.59-.59s1.29-.92,1.69-1.57c.4-.65.6-1.36.6-2.12v-2.45c-.16.12-.43.24-.81.35-.38.11-.8.21-1.26.3s-.92.16-1.37.22-.83.11-1.14.15c-.72.1-1.37.26-1.95.48s-1.04.54-1.36.94c-.33.4-.49.92-.49,1.57,0,.59.15,1.09.45,1.49.3.4.72.71,1.24.92.53.21,1.13.32,1.81.32Z"/>
      <path d="M113.38,5.07v27.65h-4.82V5.07h4.82Z"/>
      <path d="M118.61,40.12l1.13-3.77.57.15c.73.19,1.38.24,1.95.16.57-.08,1.05-.33,1.43-.74.38-.41.66-1.02.82-1.81l.3-1.32-7.83-20.82h5.16l3.79,11.28c.45,1.34.81,2.67,1.1,3.99.28,1.32.6,2.68.95,4.06h-1.26c.33-1.39.67-2.74,1-4.07.33-1.33.72-2.66,1.17-3.98l3.92-11.28h5.1l-8.91,23.42c-.42,1.1-.95,2.04-1.58,2.83-.63.79-1.4,1.38-2.32,1.79-.92.41-2,.61-3.25.61-.68,0-1.31-.05-1.88-.15-.58-.1-1.02-.22-1.35-.35Z"/>
      <path d="M149.02,33.15c-1.6,0-3.01-.23-4.23-.69-1.22-.46-2.23-1.13-3.02-2-.79-.88-1.3-1.94-1.53-3.19l4.51-.85c.28,1.03.79,1.79,1.51,2.29s1.67.75,2.85.75,2.13-.24,2.83-.71c.7-.48,1.05-1.07,1.05-1.77,0-.59-.23-1.09-.69-1.48-.46-.39-1.16-.69-2.12-.9l-3.54-.76c-1.96-.42-3.41-1.11-4.38-2.08s-1.45-2.21-1.45-3.73c0-1.29.35-2.4,1.06-3.34s1.69-1.67,2.94-2.19c1.26-.52,2.71-.78,4.37-.78,1.57,0,2.92.22,4.05.67,1.13.45,2.05,1.07,2.75,1.86.7.8,1.18,1.73,1.46,2.81l-4.3.85c-.24-.73-.66-1.35-1.28-1.85-.62-.5-1.49-.75-2.62-.75-1.03,0-1.88.23-2.57.68-.69.45-1.03,1.03-1.03,1.73,0,.61.23,1.11.69,1.5.46.4,1.21.71,2.26.93l3.53.74c1.97.42,3.43,1.09,4.38,2.02.95.93,1.43,2.12,1.43,3.58,0,1.31-.38,2.46-1.13,3.46-.75,1-1.8,1.78-3.15,2.34-1.34.56-2.89.84-4.63.84Z"/>
      <path d="M171.64,11.98v3.79h-11.78v-3.79h11.78ZM162.81,7.04h4.82v19.84c0,.75.16,1.31.48,1.66s.85.53,1.58.53c.22,0,.52-.03.88-.08.36-.06.66-.11.88-.16l.76,3.73c-.53.16-1.08.27-1.63.34s-1.09.1-1.6.1c-1.99,0-3.52-.49-4.58-1.48-1.06-.99-1.6-2.4-1.6-4.23V7.04Z"/>
      <rect y="4.95" width="18.05" height="5.07"/>
      <rect x="1.42" y="16.51" width="28.2" height="5.07" transform="translate(34.56 3.53) rotate(90)"/>
    </g>
    <rect x="18.05" width="12.98" height="5.07" fill="#2fac66"/>
  </g>
</svg>"""


def _build_html(greeting: str, body_line1: str, body_line2: str,
                button_text: str, reset_url: str, disclaimer: str, footer: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tradalyst</title>
</head>
<body style="margin:0;padding:0;background-color:#0f1110;font-family:'IBM Plex Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1110;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="padding-bottom:8px;">
              {_LOGO_SVG}
            </td>
          </tr>
          <tr>
            <td style="background-color:#181c1a;border:1px solid rgba(255,255,255,0.08);padding:40px 40px 36px;">
              <p style="margin:0 0 20px;font-size:15px;color:#e5e7eb;line-height:1.5;">{greeting}</p>
              <p style="margin:0 0 12px;font-size:14px;color:#9ca3af;line-height:1.6;">{body_line1}</p>
              <p style="margin:0 0 32px;font-size:14px;color:#9ca3af;line-height:1.6;">{body_line2}</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#2fac66;border-radius:2px;">
                    <a href="{reset_url}"
                       style="display:inline-block;padding:13px 28px;font-size:13px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">
                      {button_text}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.6;">{disclaimer}</p>
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:24px 0;">
              <p style="margin:0;font-size:12px;color:#4b5563;">{footer}</p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;">
              <p style="margin:0;font-size:11px;color:#374151;text-align:center;">
                tradalyst.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_password_reset_email(user: CustomUser, token: PasswordResetToken) -> None:
    """Send a branded password-reset email via SendGrid."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token.token}"
    is_english = getattr(user, "language_preference", "es") == "en"
    name = user.display_name or ("there" if is_english else "")

    if is_english:
        subject = "Reset your password — Tradalyst"
        button_text = "Reset password"
        greeting = f"Hi {name},"
        body_line1 = "We received a request to reset the password for your Tradalyst account."
        body_line2 = "Click the button below to create a new password. This link is valid for 1 hour."
        disclaimer = "If you didn't request this, you can ignore this email. Your password won't change."
        footer = "The Tradalyst team"
    else:
        subject = "Restablece tu contraseña — Tradalyst"
        button_text = "Restablecer contraseña"
        greeting = f"Hola {name},"
        body_line1 = "Recibimos una solicitud para restablecer la contraseña de tu cuenta en Tradalyst."
        body_line2 = "Haz clic en el botón para crear una nueva contraseña. Este enlace es válido durante 1 hora."
        disclaimer = "Si no solicitaste este cambio, ignora este correo. Tu contraseña no cambiará."
        footer = "El equipo de Tradalyst"

    plain_text = (
        f"{greeting}\n\n"
        f"{body_line1}\n\n"
        f"{body_line2}\n\n"
        f"{reset_url}\n\n"
        f"{disclaimer}\n\n"
        f"{footer}"
    )

    html_content = _build_html(
        greeting=greeting,
        body_line1=body_line1,
        body_line2=body_line2,
        button_text=button_text,
        reset_url=reset_url,
        disclaimer=disclaimer,
        footer=footer,
    )

    message = Mail(
        from_email=settings.FROM_EMAIL,
        to_emails=user.email,
        subject=subject,
        plain_text_content=plain_text,
        html_content=html_content,
    )

    if not settings.SENDGRID_API_KEY:
        logger.warning(
            "SENDGRID_API_KEY not configured — skipping email to %s. Reset URL: %s",
            user.email,
            reset_url,
        )
        return

    try:
        client = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = client.send(message)
        logger.info("Password reset email sent to %s (status %s)", user.email, response.status_code)
    except Exception as exc:
        logger.error("Failed to send password reset email to %s: %s", user.email, exc)
        raise
