import { odataGet, odataPost } from "../odata/client";
import { PreparedOrder } from "./orderService";

export async function createDraftRealization(order: PreparedOrder) {
  const body = {
    Posted: false,
    Склад_Key: order.warehouseRef,
    ЗаказКлиента_Key: order.ref,
    Товары: order.lines.map((l, i) => ({
      LineNumber: String(i + 1),
      КодСтроки: l.lineCode,
      Номенклатура_Key: l.nomenclatureRef,
      Количество: l.qty,
      Цена: l.price,
      СтавкаНДС_Key: l.vatRateRef,
      Сумма: l.amount,
      СуммаНДС: l.vatAmount,
      СуммаСНДС: l.amountWithVat,
    })),
  };

  const created = await odataPost("Document_РеализацияТоваровУслуг", body);
  if (!created?.Ref_Key) throw new Error("1С не вернула Ref_Key созданного документа");

  const confirmed = await odataGet(`Document_РеализацияТоваровУслуг(guid'${created.Ref_Key}')`);
  if (!confirmed?.Ref_Key) throw new Error("Документ не найден при повторном чтении — запись не подтверждена");

  return { ref: confirmed.Ref_Key as string, number: confirmed.Number as string };
}