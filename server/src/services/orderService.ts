import { odataGet, odataFetchAll } from "../odata/client";
import { calcLine, calcTotals } from "../domain/money";

async function loadRefMap<T>(path: string, pick: (row: any) => T): Promise<Record<string, T>> {
  const rows = await odataFetchAll(path);
  return Object.fromEntries(rows.map((r) => [r.Ref_Key, pick(r)]));
}

export async function loadOrder(orderRef: string) {
  const [order, nomenclature, vatRates, warehouses, partners, stockRows] = await Promise.all([
    odataGet(`Document_ЗаказКлиента(guid'${orderRef}')`),
    loadRefMap("Catalog_Номенклатура", (r) => ({ article: r.Артикул as string, name: r.Description as string })),
    loadRefMap("Catalog_СтавкиНДС", (r) => ({ percent: r.Ставка as number, name: r.Description as string })),
    loadRefMap("Catalog_Склады", (r) => r.Description as string),
    loadRefMap("Catalog_Партнеры", (r) => r.Description as string),
    odataFetchAll("AccumulationRegister_ТоварыНаСкладах/Balance"),
  ]);

  const priceIncludesVat = Boolean(order.ЦенаВключаетНДС);
  const warehouseRef = order.Склад_Key as string;

  const stockOf = (nomenclatureRef: string) => {
    const row = stockRows.find((r: any) => r.Склад_Key === warehouseRef && r.Номенклатура_Key === nomenclatureRef);
    return row ? row.ВНаличииBalance - row.КОтгрузкеBalance : 0;
  };

  const lines = (order.Товары as any[]).map((row) => {
    const nom = nomenclature[row.Номенклатура_Key];
    const vat = vatRates[row.СтавкаНДС_Key];
    const calculated = calcLine(
      { article: nom.article, name: nom.name, qty: row.Количество, price: row.Цена, vatName: vat.name, vatPercent: vat.percent },
      priceIncludesVat
    );
    return {
      ...calculated,
      stock: stockOf(row.Номенклатура_Key),
      nomenclatureRef: row.Номенклатура_Key as string,
      vatRateRef: row.СтавкаНДС_Key as string,
      lineCode: row.КодСтроки as number,
    };
  });

  return {
    ref: order.Ref_Key as string,
    number: order.Number as string,
    date: order.Date as string,
    warehouseRef,
    warehouseName: warehouses[warehouseRef] ?? "",
    partnerName: partners[order.Партнер_Key] ?? "",
    priceIncludesVat,
    lines,
    totals: calcTotals(lines),
  };
}

export type PreparedOrder = Awaited<ReturnType<typeof loadOrder>>;