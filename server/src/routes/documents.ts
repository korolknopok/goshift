import { Router } from "express";
import { loadOrder, PreparedOrder } from "../services/orderService";
import { createDraftRealization } from "../services/documentService";
import { genitiveFullName } from "../domain/fio";
import { generateHandoutPdf } from "../pdf/generate";

export const documentsRouter = Router();

interface CustomerInput {
  lastName: string;
  firstName: string;
  middleName?: string;
  gender?: string;
  phone: string;
  email: string;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 ? "+7" + digits.slice(1) : phone;
}

function validate(customer: any): { errors: Record<string, string> } | { customer: CustomerInput } {
  const errors: Record<string, string> = {};
  for (const field of ["lastName", "firstName", "phone", "email"]) {
    if (!customer?.[field]?.trim()) errors[field] = "Поле обязательно";
  }
  if (customer?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    errors.email = "Некорректный email";
  }
  return Object.keys(errors).length ? { errors } : { customer };
}

function buildPreview(order: PreparedOrder, customer: CustomerInput) {
  const { text: fullNameGenitive } = genitiveFullName(customer);

  return {
    customer: { fullNameGenitive, phone: normalizePhone(customer.phone), email: customer.email },
    order: {
      number: order.number,
      date: order.date,
      warehouse: order.warehouseName,
      priceIncludesVat: order.priceIncludesVat,
    },
    lines: order.lines.map(({ stock, nomenclatureRef, vatRateRef, lineCode, ...l }) => l),
    totals: order.totals,
    stock: order.lines.map((l) => ({ article: l.article, stock: l.stock })),
  };
}

documentsRouter.post("/documents/preview", async (req, res) => {
  const { orderRef, customer } = req.body ?? {};
  if (!orderRef) return res.status(400).json({ error: "orderRef обязателен" });

  const result = validate(customer);
  if ("errors" in result) return res.status(400).json({ error: "Некорректные данные получателя", fields: result.errors });

  try {
    const order = await loadOrder(orderRef);
    res.json(buildPreview(order, result.customer));
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

documentsRouter.post("/documents", async (req, res) => {
  const { orderRef, customer } = req.body ?? {};
  if (!orderRef) return res.status(400).json({ error: "orderRef обязателен" });

  const result = validate(customer);
  if ("errors" in result) return res.status(400).json({ error: "Некорректные данные получателя", fields: result.errors });

  try {
    const order = await loadOrder(orderRef);
    const preview = buildPreview(order, result.customer);

    try {
      await createDraftRealization(order);
    } catch (e) {
      res.setHeader("X-Realization-Warning", encodeURIComponent(e instanceof Error ? e.message : String(e)));
    }

    const filename = encodeURIComponent(`handout-${preview.order.number}.pdf`);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="handout.pdf"; filename*=UTF-8''${filename}`);
    const pdf = generateHandoutPdf(preview);
    pdf.pipe(res);
    pdf.end();
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : String(e) });
  }
});

documentsRouter.get("/orders/:ref", async (req, res) => {
  try {
    const order = await loadOrder(req.params.ref);
    res.json(order);
  } catch (e) {
    res.status(502).json({ error: e instanceof Error ? e.message : String(e) });
  }
});