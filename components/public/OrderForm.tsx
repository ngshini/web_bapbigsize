"use client";

import { FormEvent, useMemo, useState } from "react";
import { calculatePromotionPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/formatCurrency";

type Variant = {
  size: string;
  color: string;
  stockQuantity: number;
  isActive: boolean;
};

export function OrderForm({ productId, variants, phone }: { productId: string; variants: Variant[]; phone: string }) {
  const colors = Array.from(new Set(variants.filter((v) => v.isActive).map((v) => v.color)));
  const sizes = Array.from(new Set(variants.filter((v) => v.isActive).map((v) => v.size)));
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "", size: sizes[0] ?? "", color: colors[0] ?? "", quantity: 1, note: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => calculatePromotionPrice(Number(form.quantity) || 1), [form.quantity]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, productId })
    });
    const data = await response.json();
    setLoading(false);
    setMessage(response.ok ? `Đặt hàng thành công. Mã đơn: ${data.orderCode}` : data.error ?? "Không thể đặt hàng");
  }

  return (
    <form id="dat-hang" onSubmit={submit} className="space-y-3 rounded-md border border-brand-100 bg-white p-3 shadow-soft sm:p-4">
      <h3 className="text-lg font-bold text-brand-900">Đặt hàng nhanh</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="min-h-12" required placeholder="Họ và tên" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <input className="min-h-12" required placeholder="Số điện thoại" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
      </div>
      <input className="min-h-12" required placeholder="Địa chỉ nhận hàng" value={form.customerAddress} onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <select className="min-h-12" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}>
          {sizes.map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>
        <select className="min-h-12" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
          {colors.map((color) => (
            <option key={color}>{color}</option>
          ))}
        </select>
        <input className="min-h-12" type="number" min={1} max={99} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
      </div>
      <textarea placeholder="Ghi chú" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
      <div className="rounded-md bg-brand-50 p-3 font-bold text-brand-900">Tạm tính: {formatCurrency(total)}</div>
      {message ? <p className="rounded-md bg-green-50 p-3 text-sm font-medium text-green-800">{message}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button disabled={loading} className="rounded-md bg-brand-700 px-5 py-3 font-bold text-white disabled:opacity-60 sm:flex-1">
          {loading ? "Đang đặt..." : "Đặt hàng"}
        </button>
        <a href={`https://zalo.me/${phone}`} className="rounded-md border border-brand-200 px-5 py-3 text-center font-bold text-brand-700 sm:flex-1">
          Liên hệ Zalo
        </a>
        <a href={`tel:${phone}`} className="rounded-md border border-brand-200 px-5 py-3 text-center font-bold text-brand-700 sm:flex-1">
          Gọi điện
        </a>
      </div>
    </form>
  );
}
