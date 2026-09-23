import PDFDocument from "pdfkit";
import path from "path";

const FONT = path.join(__dirname, "..", "..", "assets", "fonts", "PTSans-Regular.ttf");
const FONT_BOLD = path.join(__dirname, "..", "..", "assets", "fonts", "PTSans-Bold.ttf");

const money = (n: number) => n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const COLS = [
  { key: "article", title: "Артикул", w: 55, right: false },
  { key: "name", title: "Наименование", w: 130, right: false },
  { key: "qty", title: "Кол-во", w: 40, right: true },
  { key: "price", title: "Цена", w: 65, right: true },
  { key: "vatName", title: "Ставка", w: 50, right: false },
  { key: "amount", title: "Сумма", w: 60, right: true },
  { key: "vatAmount", title: "НДС", w: 55, right: true },
  { key: "amountWithVat", title: "С НДС", w: 65, right: true },
] as const;

const CELL_PADDING = 4;

export function generateHandoutPdf(preview: any) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.registerFont("f", FONT).registerFont("fb", FONT_BOLD).font("f");

  doc.font("fb").fontSize(14).text(`Выдать ${preview.customer.fullNameGenitive}`);
  doc.font("f").fontSize(11);
  doc.text(`Телефон: ${preview.customer.phone}`);
  doc.text(`Почта: ${preview.customer.email}`);
  doc.moveDown();
  doc.text(`Заказ: ${preview.order.number} от ${new Date(preview.order.date).toLocaleDateString("ru-RU")}`);
  doc.text(`Склад: ${preview.order.warehouse}`);
  doc.moveDown();

  const startX = doc.x;
  let y = doc.y;

  const row = (values: Record<string, string>, bold: boolean) => {
    doc.font(bold ? "fb" : "f").fontSize(9);
    let x = startX;
    for (const c of COLS) {
      doc.text(values[c.key] ?? "", x, y, { width: c.w - CELL_PADDING, align: c.right ? "right" : "left" });
      x += c.w;
    }
    y += 16;
    return x;
  };

  row(Object.fromEntries(COLS.map((c) => [c.key, c.title])), true);
  let lineEndX = startX;
  for (const l of preview.lines) {
    lineEndX = row(
      {
        article: l.article, name: l.name, qty: String(l.qty), price: money(l.price), vatName: l.vatName,
        amount: money(l.amount), vatAmount: money(l.vatAmount), amountWithVat: money(l.amountWithVat),
      },
      false
    );
  }

  y += 6;
  doc.moveTo(startX, y).lineTo(lineEndX, y).stroke();
  y += 10;
  doc.font("fb").fontSize(10).text(
    `Итого: ${money(preview.totals.amount)}   НДС: ${money(preview.totals.vatAmount)}   Всего с НДС: ${money(preview.totals.amountWithVat)}`,
    startX, y
  );

  return doc;
}