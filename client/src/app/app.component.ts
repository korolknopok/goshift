import { Component, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

interface OrderLine {
  article: string;
  name: string;
  qty: number;
  price: number;
  vatName: string;
  amount: number;
  vatAmount: number;
  amountWithVat: number;
  stock: number;
}

interface Order {
  number: string;
  date: string;
  warehouseName: string;
  lines: OrderLine[];
  totals: { amount: number; vatAmount: number; amountWithVat: number };
}

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  orderRef = "";
  order: Order | null = null;
  loading = false;
  submitting = false;
  error = "";
  fieldErrors: Record<string, string> = {};

  customer = { lastName: "", firstName: "", middleName: "", phone: "", email: "" };

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  async load(): Promise<void> {
    if (!this.orderRef.trim()) return;
    this.loading = true;
    this.error = "";
    this.order = null;
    try {
      this.order = await firstValueFrom(this.http.get<Order>(`/api/orders/${this.orderRef.trim()}`));
    } catch (e: any) {
      this.error = e?.error?.error ?? "Не удалось загрузить заказ";
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async submit(): Promise<void> {
    this.submitting = true;
    this.error = "";
    this.fieldErrors = {};
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderRef: this.orderRef.trim(), customer: this.customer }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        this.fieldErrors = body?.fields ?? {};
        throw new Error(body?.error ?? `Ошибка ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "handout.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      this.error = e?.message ?? "Не удалось сформировать документ";
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }

  money(n: number): string {
    return n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}