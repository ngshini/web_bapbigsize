"use client";

import { FormEvent, useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";
import { Package, Search, ChevronDown, ChevronUp, Clock, CheckCircle, Truck, XCircle, BadgeCheck } from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: { name: string; productCode: string; slug: string } | null;
};

type Order = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  note?: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING:   { label: "Chờ xác nhận", color: "text-amber-700 bg-amber-50 border-amber-200",   icon: Clock },
  CONFIRMED: { label: "Đã xác nhận",  color: "text-blue-700 bg-blue-50 border-blue-200",      icon: BadgeCheck },
  SHIPPING:  { label: "Đang giao",    color: "text-purple-700 bg-purple-50 border-purple-200", icon: Truck },
  COMPLETED: { label: "Hoàn thành",   color: "text-green-700 bg-green-50 border-green-200",    icon: CheckCircle },
  CANCELLED: { label: "Đã hủy",       color: "text-red-700 bg-red-50 border-red-200",          icon: XCircle }
};

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const status = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING;
  const StatusIcon = status.icon;

  return (
    <div className="overflow-hidden rounded-md border border-brand-100 bg-white shadow-sm">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left transition hover:bg-brand-50"
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-brand-900">#{order.orderCode}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${status.color}`}>
              <StatusIcon size={12} />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
        </div>
        {open ? <ChevronUp size={20} className="mt-1 shrink-0 text-slate-400" /> : <ChevronDown size={20} className="mt-1 shrink-0 text-slate-400" />}
      </button>

      {open && (
        <div className="border-t border-brand-50 p-4 text-sm">
          <div className="space-y-3">
            <div className="grid gap-1 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Người nhận</p>
                <p className="mt-1 font-semibold text-brand-900">{order.customerName}</p>
                <p className="text-slate-600">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Địa chỉ giao</p>
                <p className="mt-1 leading-5 text-slate-600">{order.customerAddress}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Sản phẩm</p>
              <div className="mt-2 divide-y divide-brand-50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 py-2">
                    <div>
                      <p className="font-semibold text-brand-900">{item.productName}</p>
                      <p className="text-xs text-slate-500">
                        Size {item.size} · {item.color} · x{item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-brand-700">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.note && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Ghi chú</p>
                <p className="mt-1 text-slate-600">{order.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrderLookupPage() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = phone.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrders(null);

    const response = await fetch(`/api/orders?phone=${encodeURIComponent(trimmed)}`);
    const data = await response.json();
    setLoading(false);

    if (response.ok) {
      setOrders(data.orders);
    } else {
      setError(data.error ?? "Không thể tra cứu đơn hàng");
    }
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100">
          <Package size={32} className="text-brand-700" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-brand-900">Tra cứu đơn hàng</h1>
        <p className="mt-2 text-slate-600">Nhập số điện thoại đã dùng khi đặt hàng để xem tình trạng đơn</p>
      </div>

      <form onSubmit={handleSearch} className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="tel"
            required
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-4 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand-700 px-6 py-3 font-bold text-white transition hover:bg-brand-900 disabled:opacity-60"
        >
          {loading ? "Đang tìm..." : "Tra cứu"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {orders !== null && (
        <div className="mt-6">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-brand-100 bg-white p-8 text-center">
              <Package size={40} className="text-slate-300" />
              <p className="font-semibold text-slate-600">Không tìm thấy đơn hàng nào</p>
              <p className="text-sm text-slate-400">Kiểm tra lại số điện thoại hoặc liên hệ shop để được hỗ trợ</p>
              <Link href="/#lien-he" className="mt-2 rounded-md bg-brand-700 px-5 py-2.5 text-sm font-bold text-white">
                Liên hệ shop
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-3 text-sm font-semibold text-slate-600">
                Tìm thấy <span className="text-brand-700">{orders.length}</span> đơn hàng
              </p>
              <div className="space-y-3">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
