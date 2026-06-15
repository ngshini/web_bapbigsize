"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, Minus, Plus, ShoppingCart, Trash2, Truck } from "lucide-react";
import { calculatePromotionPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/formatCurrency";
import { AddressSelect } from "@/components/public/AddressSelect";

const CART_KEY = "bap-bigsize-cart";

type CartItem = {
  productId: string;
  productCode?: string;
  name: string;
  imageUrl?: string | null;
  salePrice: number;
  originalPrice: number;
  size: string;
  color: string;
  quantity: number;
};

export function CartCheckoutPage({ phone }: { phone: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", customerAddress: "", province: "", district: "", ward: "", note: "" });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "MOMO" | "VNPAY">("COD");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => items.reduce((sum, item) => sum + calculatePromotionPrice(item.quantity, item.salePrice), 0), [items]);

  useEffect(() => {
    try {
      const rawCart = window.localStorage.getItem(CART_KEY);
      if (!rawCart) {
        setItems([]);
        return;
      }
      const parsed = JSON.parse(rawCart);
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      window.localStorage.removeItem(CART_KEY);
      setItems([]);
    }
  }, []);

  function save(nextItems: CartItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(CART_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cart-updated"));
  }

  function updateQuantity(index: number, quantity: number) {
    save(items.map((item, itemIndex) => (itemIndex === index ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) } : item)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const fullAddress = [form.customerAddress, form.ward, form.district, form.province].filter(Boolean).join(", ");
    const payload = {
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: fullAddress,
      note: form.note,
      items: items.map((item) => ({ productId: item.productId, size: item.size, color: item.color, quantity: item.quantity }))
    };
    const endpoint = paymentMethod === "MOMO" ? "/api/payments/momo" : paymentMethod === "VNPAY" ? "/api/payments/vnpay" : "/api/orders";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    setLoading(false);
    if (response.ok) {
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        save([]);
        setMessage(`Đặt hàng thành công. Mã đơn: ${data.orderCode}`);
      }
    } else {
      setMessage(data.error ?? "Không thể đặt hàng");
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_470px]">
      <section>
        <p className="text-sm text-slate-500">Trang chủ / Giỏ hàng</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Thông tin đơn hàng</h1>
        <div className="mt-6 grid gap-4">
          <input required className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Họ và tên" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
          <input required className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Số điện thoại" value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} />
          <input required className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Địa chỉ" value={form.customerAddress} onChange={(event) => setForm({ ...form, customerAddress: event.target.value })} />
          <AddressSelect
            value={{ province: form.province, district: form.district, ward: form.ward }}
            onChange={(addr) => setForm({ ...form, ...addr })}
          />
          <input className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Ví dụ: giao hàng giờ hành chính" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        </div>

        <div className="mt-7">
          <h2 className="text-2xl font-bold text-brand-900">Phương thức vận chuyển</h2>
          <div className="mt-3 flex items-center gap-3 rounded-md border-2 border-brand-700 p-5 text-lg">
            <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-brand-700">
              <span className="h-3 w-3 rounded-full bg-brand-700" />
            </span>
            <Truck size={30} className="text-brand-700" />
            Freeship đơn hàng
          </div>
        </div>

        <div className="mt-7">
          <h2 className="text-2xl font-bold text-brand-900">Hình thức thanh toán</h2>
          <div className="mt-3 grid gap-3">
            {[
              { value: "COD", label: "COD", text: "Thanh toán khi giao hàng" },
              { value: "MOMO", label: "MoMo", text: "Thanh toán sandbox qua ví MoMo" },
              { value: "VNPAY", label: "VNPAY", text: "Thanh toán sandbox qua VNPAY" }
            ].map((method) => (
              <button
                key={method.value}
                type="button"
                onClick={() => setPaymentMethod(method.value as "COD" | "MOMO" | "VNPAY")}
                className={`flex items-center gap-3 rounded-md border-2 p-5 text-left text-lg ${paymentMethod === method.value ? "border-brand-700 bg-brand-50" : "border-slate-200 bg-white"}`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${paymentMethod === method.value ? "border-brand-700" : "border-slate-300"}`}>
                  {paymentMethod === method.value ? <span className="h-3 w-3 rounded-full bg-brand-700" /> : null}
                </span>
                <CreditCard size={30} className="text-brand-700" />
                <span>
                  <span className="font-bold">{method.label}</span>
                  <span className="ml-2 text-slate-600">{method.text}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside>
        <div className="mb-4 flex items-center gap-3">
          <ShoppingCart size={34} className="text-brand-700" />
          <div>
            <h2 className="text-3xl font-bold text-brand-900">Giỏ hàng</h2>
            <a href={`tel:${phone}`} className="text-sm font-bold text-brand-700">
              Cần hỗ trợ? Gọi {phone}
            </a>
          </div>
        </div>

        {items.length ? (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-[110px_1fr_auto] gap-4">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-brand-50">
                    {item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill sizes="130px" className="object-cover" /> : null}
                  </div>
                  <div>
                    <p className="line-clamp-2 text-lg font-bold text-brand-900">{item.name}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">Mã {item.productCode}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.color} / {item.size}
                    </p>
                    <div className="mt-3 inline-flex items-center overflow-hidden rounded-md border border-slate-200">
                      <button type="button" onClick={() => updateQuantity(index, item.quantity - 1)} className="grid h-9 w-10 place-items-center text-brand-700">
                        <Minus size={16} />
                      </button>
                      <span className="grid h-9 min-w-10 place-items-center font-bold">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(index, item.quantity + 1)} className="grid h-9 w-10 place-items-center text-brand-700">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <button type="button" onClick={() => save(items.filter((_, itemIndex) => itemIndex !== index))} className="text-slate-400 hover:text-red-600">
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="mt-3 text-right text-lg font-bold text-brand-900">{formatCurrency(calculatePromotionPrice(item.quantity, item.salePrice))}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-brand-100 bg-brand-50 p-5 text-center">
            <p className="font-bold text-brand-900">Giỏ hàng đang trống</p>
            <Link href="/san-pham" className="mt-3 inline-block rounded-md bg-brand-700 px-5 py-3 font-bold text-white">
              Xem sản phẩm
            </Link>
          </div>
        )}

        <div className="mt-5 rounded-md border border-brand-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-lg">
            <span>Tạm tính</span>
            <span className="font-bold">{formatCurrency(total)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-lg">
            <span>Phí vận chuyển</span>
            <span className="font-bold text-green-700">Miễn phí</span>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold text-brand-900">Tổng tiền</span>
              <span className="text-3xl font-bold text-brand-700">{formatCurrency(total)}</span>
            </div>
            {message ? <p className="mt-3 rounded-md bg-green-50 p-3 text-sm font-bold text-green-800">{message}</p> : null}
            <button disabled={loading || !items.length} className="mt-4 w-full rounded-md bg-brand-700 px-5 py-4 text-xl font-bold text-white disabled:opacity-60">
              {loading ? "Đang xử lý..." : paymentMethod === "COD" ? "Thanh toán COD" : `Thanh toán ${paymentMethod}`}
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}
