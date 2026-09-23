import Decimal from "decimal.js";
Decimal.set({ rounding: Decimal.ROUND_HALF_UP });

export interface OrderLineInput {
  article: string;
  name: string;
  qty: number;
  price: number;
  vatName: string;
  vatPercent: number;
}

export interface CalculatedLine extends OrderLineInput {
  amount: number;
  vatAmount: number;
  amountWithVat: number;
}

export function calcLine(line: OrderLineInput, priceIncludesVat: boolean): CalculatedLine {
  const amount = new Decimal(line.qty).mul(line.price).toDecimalPlaces(2);
  const rate = new Decimal(line.vatPercent);

  const vatAmount = priceIncludesVat
    ? amount.mul(rate).div(rate.plus(100)).toDecimalPlaces(2)
    : amount.mul(rate).div(100).toDecimalPlaces(2);

  const amountWithVat = priceIncludesVat ? amount : amount.plus(vatAmount);

  return {
    ...line,
    amount: amount.toNumber(),
    vatAmount: vatAmount.toNumber(),
    amountWithVat: amountWithVat.toNumber(),
  };
}

export function calcTotals(lines: CalculatedLine[]) {
  const sum = (pick: (l: CalculatedLine) => number) =>
    lines.reduce((a, l) => a.plus(pick(l)), new Decimal(0)).toDecimalPlaces(2).toNumber();

  return {
    amount: sum((l) => l.amount),
    vatAmount: sum((l) => l.vatAmount),
    amountWithVat: sum((l) => l.amountWithVat),
  };
}