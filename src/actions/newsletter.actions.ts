"use server";

import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { SubscriberStatus } from "@prisma/client";
import { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

export type NewsletterActionState = {
  success: boolean;
  message: string;
} | null;

// ── Validation ────────────────────────────────────────────────────────────────

const subscribeSchema = z.object({
  email: z.email("Ingresa un correo válido."),
  source: z.string().optional(),
});

// ── Action ────────────────────────────────────────────────────────────────────

export async function subscribeAction(
  _prevState: NewsletterActionState,
  formData: FormData,
): Promise<NewsletterActionState> {
  const raw = {
    email: formData.get("email"),
    source: formData.get("source"),
  };

  const parsed = subscribeSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const { email, source } = parsed.data;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://blog.guvery.com";

  try {
    const existing = await prisma.subscriber.findUnique({ where: { email } });

    // Already confirmed
    if (existing?.status === SubscriberStatus.CONFIRMED) {
      return { success: false, message: "Este correo ya está suscrito." };
    }

    // Generate new confirmation token
    const confirmationToken = crypto.randomUUID();
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${confirmationToken}`;

    // Upsert — create or reactivate
    await prisma.subscriber.upsert({
      where: { email },
      update: {
        status: SubscriberStatus.PENDING,
        confirmationToken,
        confirmedAt: null,
        source: source ?? existing?.source,
      },
      create: {
        email,
        status: SubscriberStatus.PENDING,
        confirmationToken,
        source: source ?? null,
      },
    });

    // Send confirmation email
    const { error: sendError } = await resend.emails.send({
      from: "Guvery Blog <onboarding@resend.dev>",
      to: email,
      subject: "Confirma tu suscripción al Blog de Guvery",
      html: buildConfirmationEmail(confirmUrl),
    });

    if (sendError) {
      throw new Error(sendError.message);
    }

    return {
      success: true,
      message: "¡Listo! Revisa tu correo y confirma tu suscripción.",
    };
  } catch {
    return {
      success: false,
      message: "Ocurrió un error. Inténtalo de nuevo más tarde.",
    };
  }
}

// ── Email template ────────────────────────────────────────────────────────────

function buildConfirmationEmail(confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#E86C2C,#f08040);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                Guvery Blog
              </h1>
              <p style="margin:8px 0 0;color:#fff7f0;font-size:14px;">
                Aprende a comprar en Amazon desde Perú
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">
                ¡Un paso más para confirmar!
              </h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Gracias por suscribirte al Blog de Guvery. Para empezar a recibir
                nuestras guías sobre compras internacionales, haz clic en el botón
                de abajo para confirmar tu correo electrónico.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${confirmUrl}"
                   style="display:inline-block;background:#E86C2C;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;">
                  Confirmar mi suscripción →
                </a>
              </div>
              <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.5;">
                Si no solicitaste esta suscripción, puedes ignorar este correo.
                El enlace expira en 48 horas.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #f3f4f6;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2025 Guvery Blog &nbsp;·&nbsp;
                <a href="https://guvery.com" style="color:#E86C2C;text-decoration:none;">guvery.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
