// /src/pages/api/quotes.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res
      .status(200)
      .json({ ok: true, hint: "Usa POST con {customer, cart, total}" });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { customer, cart, total } = req.body || {};

    if (
      !customer?.email ||
      !customer?.name ||
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Faltan datos para enviar la cotización." });
    }

    // Gmail SMTP (requiere App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const FROM = process.env.GMAIL_USER; // igual al user SMTP
    const TO = process.env.QUOTE_TO_EMAIL || FROM;

    const rows = cart
      .map((i, idx) => {
        const unit = Number(i.price ?? i.unit_price ?? 0);
        const qty = Number(i.qty ?? 1);
        const subtotal = unit * qty;
        const sku = i?.variant?.sku || i?.sku || "—";
        const notes = [
          i?.belowMinimum ? "Cantidad menor al mínimo" : null,
          i?.pricingNote || null,
        ]
          .filter(Boolean)
          .join(" · ");
        return `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #eee;">${idx + 1}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${
            i.name || i.title || "Producto"
          }</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${sku}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${qty}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$ ${unit.toLocaleString(
            "es-AR",
            { minimumFractionDigits: 2 }
          )}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">$ ${subtotal.toLocaleString(
            "es-AR",
            { minimumFractionDigits: 2 }
          )}</td>
        </tr>
        ${
          notes
            ? `<tr><td></td><td colspan="5" style="padding:0 6px 10px;color:#6b7280;font-size:12px;">${notes}</td></tr>`
            : ""
        }
      `;
      })
      .join("");

    const totalFmt = Number(total || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    });

    const html = `
      <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto;">
        <h2 style="margin:0 0 12px;">Nueva solicitud de cotización</h2>
        <h3 style="margin:16px 0 6px;">Cliente</h3>
        <ul style="margin:0 0 12px;padding-left:16px;">
          <li><strong>Nombre:</strong> ${customer.name}</li>
          <li><strong>Empresa:</strong> ${customer.company || "—"}</li>
          <li><strong>Email:</strong> ${customer.email}</li>
          <li><strong>Teléfono:</strong> ${customer.phone || "—"}</li>
        </ul>
        ${
          customer.message
            ? `<p style="margin:8px 0 16px;"><strong>Mensaje:</strong> ${customer.message}</p>`
            : ""
        }
        <h3 style="margin:16px 0 6px;">Carrito</h3>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr>
              <th style="text-align:left;padding:6px;border-bottom:2px solid #111;">#</th>
              <th style="text-align:left;padding:6px;border-bottom:2px solid #111;">Producto</th>
              <th style="text-align:left;padding:6px;border-bottom:2px solid #111;">SKU</th>
              <th style="text-align:right;padding:6px;border-bottom:2px solid #111;">Cant.</th>
              <th style="text-align:right;padding:6px;border-bottom:2px solid #111;">Unitario</th>
              <th style="text-align:right;padding:6px;border-bottom:2px solid #111;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="5" style="padding:10px 6px;text-align:right;font-weight:700;">Total</td>
              <td style="padding:10px 6px;text-align:right;font-weight:700;">$ ${totalFmt}</td>
            </tr>
          </tfoot>
        </table>
        <p style="color:#6b7280;font-size:12px;margin-top:14px;">
          Nota: los precios unitarios pueden ajustarse según cantidades finales y técnica de impresión.
        </p>
      </div>
    `;

    const rowsText = cart
      .map((i, n) => {
        const unit = Number(i.price ?? i.unit_price ?? 0);
        const qty = Number(i.qty ?? 1);
        const sub = unit * qty;
        const sku = i?.variant?.sku || i?.sku || "—";
        return `${n + 1}. ${
          i.name || i.title
        } | SKU ${sku} | x${qty} | $${unit.toFixed(2)} = $${sub.toFixed(2)}`;
      })
      .join("\n");

    await transporter.sendMail({
      from: `"Brandcaps Cotizaciones" <${FROM}>`, // <-- mismo dominio/casilla del SMTP
      sender: FROM, // opcional: refuerza el envelope-from
      envelope: { from: FROM, to: TO }, // opcional: alinea MAIL FROM (SPF)
      to: TO,
      replyTo: customer.email,
      subject: `[Cotización web] ${customer.company || customer.name}`,
      text: `Cliente: ${customer.name}
Email: ${customer.email}
Teléfono: ${customer.phone || "—"}
Empresa: ${customer.company || "—"}
Mensaje: ${customer.message || "—"}

Items:
${rowsText}

Total: $${Number(total || 0).toFixed(2)}

Nota: los precios unitarios pueden ajustarse según cantidades finales y técnica.`, html,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[/api/quotes] ERROR:", err);
    return res.status(500).json({ error: err.message || "Error interno" });
  }
}
