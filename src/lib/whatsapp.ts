// Unified WhatsApp helper — single source of truth for number + message format
// Covers TODO(#4): CartDrawer / carrito/page / WhatsAppButton must share fallback.
import type { CartItem } from "@/types";

const FALLBACK_NUMBER = "59170000000";

export function getWhatsAppNumber(sectionsNumber?: string | null): string {
  const env = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim();
  if (env) return env;
  const cms = sectionsNumber?.trim();
  if (cms) return cms;
  return FALLBACK_NUMBER;
}

export type WhatsAppCustomer = {
  name: string;
  phone: string;
  city: string;
  deliveryType: string;
  address: string;
};

export function buildOrderMessage(
  items: CartItem[],
  subtotal: number,
  customer?: WhatsAppCustomer | null,
  notes?: string | null
): string {
  const productLines = items
    .map((item) => {
      const variant = [item.size && `Talla ${item.size}`, item.color && item.color]
        .filter(Boolean)
        .join(" / ");
      const lineTotal = (item.price * item.quantity).toFixed(0);
      return `• ${item.product_name}${variant ? ` (${variant})` : ""} x${item.quantity} — Bs. ${lineTotal}`;
    })
    .join("\n");

  const deliveryLine = customer
    ? customer.deliveryType === "envio"
      ? `🚚 *Envío a:* ${customer.address}, ${customer.city}`
      : `🏬 *Retiro en tienda* — ${customer.city}`
    : null;

  const parts: string[] = [];

  if (customer) {
    parts.push(
      `🛍️ *NUEVO PEDIDO — FLORES STORE*`,
      ``,
      `👤 *Cliente:* ${customer.name}`,
      `📱 *Teléfono:* ${customer.phone}`,
      deliveryLine ?? "",
      ``,
      `📦 *PRODUCTOS:*`,
      productLines,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `💰 *TOTAL: Bs. ${subtotal.toFixed(0)}*`,
      `━━━━━━━━━━━━━━━━━━`
    );
  } else {
    parts.push(
      `¡Hola! Me gustaría realizar el siguiente pedido en Flores:`,
      ``,
      productLines,
      ``,
      `━━━━━━━━━━━━━━━━━━`,
      `💰 *TOTAL: Bs. ${subtotal.toFixed(0)}*`,
      `━━━━━━━━━━━━━━━━━━`
    );
  }

  if (notes?.trim()) {
    parts.push(``, `📝 *Notas:*`, notes.trim());
  }

  parts.push(
    ``,
    customer
      ? `¿Pueden confirmar disponibilidad y coordinar la entrega? 🙏`
      : `Por favor, confírmenme la disponibilidad y los datos para el pago/envío. ¡Gracias!`
  );

  return encodeURIComponent(parts.join("\n"));
}

export function buildGenericInquiryMessage(): string {
  return encodeURIComponent("¡Hola! Estoy interesado en los productos de Flores. ¿Me pueden ayudar?");
}

export function openWhatsApp(phoneNumber: string, encodedMessage: string): boolean {
  const url = encodedMessage ? `https://wa.me/${phoneNumber}?text=${encodedMessage}` : `https://wa.me/${phoneNumber}`;
  const win = window.open(url, "_blank");
  return !!win;
}
