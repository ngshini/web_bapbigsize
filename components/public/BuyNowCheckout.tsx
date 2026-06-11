"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, CreditCard, Minus, Plus, RefreshCcw, Ruler, ShoppingCart, Store, Truck, X } from "lucide-react";
import { calculatePromotionPrice } from "@/lib/pricing";
import { formatCurrency } from "@/lib/formatCurrency";

type Variant = {
  size: string;
  color: string;
  stockQuantity: number;
  isActive: boolean;
};

type BuyNowCheckoutProps = {
  product: {
    id: string;
    productCode?: string;
    name: string;
    salePrice: number;
    originalPrice: number;
    imageUrl?: string | null;
  };
  variants: Variant[];
  phone: string;
  // optional: controlled color from parent (ProductDetailClient)
  colorImageMap?: Record<string, string | null>;
  selectedColor?: string;
  onColorChange?: (color: string) => void;
};

const VIETNAM_PROVINCES = [
  "Thành phố Hà Nội",
  "Thành phố Huế",
  "Thành phố Hải Phòng",
  "Thành phố Đà Nẵng",
  "Thành phố Hồ Chí Minh",
  "Thành phố Cần Thơ",
  "Tỉnh Lai Châu",
  "Tỉnh Điện Biên",
  "Tỉnh Sơn La",
  "Tỉnh Lạng Sơn",
  "Tỉnh Quảng Ninh",
  "Tỉnh Thanh Hóa",
  "Tỉnh Nghệ An",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Cao Bằng",
  "Tỉnh Tuyên Quang",
  "Tỉnh Lào Cai",
  "Tỉnh Thái Nguyên",
  "Tỉnh Phú Thọ",
  "Tỉnh Bắc Ninh",
  "Tỉnh Hưng Yên",
  "Tỉnh Ninh Bình",
  "Tỉnh Quảng Trị",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Gia Lai",
  "Tỉnh Khánh Hòa",
  "Tỉnh Lâm Đồng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Đồng Nai",
  "Tỉnh Tây Ninh",
  "Tỉnh Vĩnh Long",
  "Tỉnh Đồng Tháp",
  "Tỉnh Cà Mau",
  "Tỉnh An Giang"
];

const CART_KEY = "bap-bigsize-cart";

type StoredCartItem = {
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

export function BuyNowCheckout({ product, variants, phone, colorImageMap = {}, selectedColor: controlledColor, onColorChange }: BuyNowCheckoutProps) {
  const activeVariants = variants.filter((variant) => variant.isActive);
  const colors = Array.from(new Set(activeVariants.map((variant) => variant.color)));
  const sizes = Array.from(new Set(activeVariants.map((variant) => variant.size)));
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    province: "",
    district: "",
    ward: "",
    size: sizes[0] ?? "",
    color: controlledColor ?? colors[0] ?? "",
    quantity: 1,
    note: ""
  });

  // Sync khi controlledColor thay đổi từ bên ngoài
  const currentColor = controlledColor ?? form.color;

  function handleColorChange(color: string) {
    setForm((prev) => ({ ...prev, color }));
    onColorChange?.(color);
  }
  const [message, setMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => calculatePromotionPrice(Number(form.quantity) || 1, product.salePrice), [form.quantity, product.salePrice]);
  const saved = product.salePrice * form.quantity - total;

  function updateQuantity(nextQuantity: number) {
    setForm((current) => ({ ...current, quantity: Math.max(1, Math.min(99, nextQuantity)) }));
  }

  function addToCart() {
    const item: StoredCartItem = {
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      imageUrl: product.imageUrl,
      salePrice: product.salePrice,
      originalPrice: product.originalPrice,
      size: form.size,
      color: form.color,
      quantity: form.quantity
    };
    let current: StoredCartItem[] = [];
    try {
      current = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as StoredCartItem[];
    } catch {
      current = [];
    }
    const existing = current.find((cartItem) => cartItem.productId === item.productId && cartItem.size === item.size && cartItem.color === item.color);
    const next = existing
      ? current.map((cartItem) => (cartItem === existing ? { ...cartItem, quantity: cartItem.quantity + item.quantity } : cartItem))
      : [...current, item];

    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("cart-updated"));
    setCartMessage("Đã thêm vào giỏ hàng");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const fullAddress = [form.customerAddress, form.ward, form.district, form.province].filter(Boolean).join(", ");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, customerAddress: fullAddress, productId: product.id })
    });
    const data = await response.json();

    setLoading(false);
    setMessage(response.ok ? `Đặt hàng thành công. Mã đơn: ${data.orderCode}` : data.error ?? "Không thể đặt hàng");
  }

  return (
    <>
      <div className="space-y-6 border-t border-slate-100 pt-5">
        <div>
          <p className="text-xl text-slate-950">
            Màu sắc: <span className="font-bold">{currentColor || "Chọn màu"}</span>
          </p>

          {/* Icon tròn: chỉ hiện cho màu đã được gán ảnh trong admin */}
          {colors.some((c) => colorImageMap[c]) && (
            <div className="mt-3 flex flex-wrap gap-4">
              {colors
                .filter((color) => colorImageMap[color]) // chỉ màu có ảnh thật
                .map((color) => {
                  const swatchImg = colorImageMap[color]!;
                  const isSelected = currentColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`relative grid place-items-center rounded-full border-2 bg-white p-1 transition ${
                        isSelected
                          ? "border-slate-950 ring-2 ring-offset-1 ring-slate-400"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                      style={{ width: 72, height: 72 }}
                      aria-label={`Chọn màu ${color}`}
                      title={color}
                    >
                      <span className="relative block h-full w-full overflow-hidden rounded-full bg-brand-50">
                        <Image src={swatchImg} alt={color} fill sizes="72px" className="object-cover" />
                      </span>
                      {isSelected && (
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-slate-800">
                          {color}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}

          {/* Dropdown: dành cho màu chưa gán ảnh hoặc khi chưa gán ảnh nào */}
          {colors.some((c) => !colorImageMap[c]) && (
            <div className="mt-3">
              <select
                className="min-h-11 rounded-md border border-slate-200 bg-white px-3 py-2 text-base"
                value={currentColor}
                onChange={(e) => handleColorChange(e.target.value)}
              >
                {colors
                  .filter((c) => !colorImageMap[c])
                  .map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </div>
          )}

          {/* Tên màu đang chọn */}
          {currentColor && (
            <p className="mt-7 text-sm text-slate-500">
              Đang xem: <span className="font-bold text-slate-800">{currentColor}</span>
            </p>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xl text-slate-950">
              Kích thước: <span className="font-bold">{form.size || "Chọn size"}</span>
            </p>
            <a href="#bang-size" className="inline-flex items-center gap-2 text-lg font-semibold text-slate-950 underline underline-offset-4">
              <Ruler size={22} />
              Hướng dẫn chọn size
            </a>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setForm({ ...form, size })}
                className={`grid h-14 min-w-16 place-items-center rounded-md border-2 px-5 text-xl font-bold transition ${
                  form.size === size ? "border-slate-950 text-slate-950" : "border-slate-200 text-slate-900 hover:border-slate-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
          <div className="grid h-14 grid-cols-3 overflow-hidden rounded-md border-2 border-[#07235f] text-[#07235f]">
            <button type="button" onClick={() => updateQuantity(form.quantity - 1)} className="grid place-items-center text-xl font-bold">
              <Minus size={22} />
            </button>
            <span className="grid place-items-center text-xl font-bold">{form.quantity}</span>
            <button type="button" onClick={() => updateQuantity(form.quantity + 1)} className="grid place-items-center text-xl font-bold">
              <Plus size={22} />
            </button>
          </div>
          <button type="button" onClick={addToCart} className="h-14 rounded-md border-2 border-[#07235f] px-5 text-xl font-bold uppercase tracking-wide text-[#07235f] transition hover:bg-[#07235f] hover:text-white">
            Thêm vào giỏ
          </button>
        </div>
        {cartMessage ? <p className="rounded-md bg-green-50 p-3 text-sm font-bold text-green-800">{cartMessage}</p> : null}

        <button
  type="button"
  onClick={() => setCheckoutOpen(true)}
  className="h-16 w-full rounded-md bg-pink-600 px-6 text-xl font-bold uppercase tracking-wide text-white transition hover:bg-pink-700"
>
  Mua ngay
</button>

        <button type="button" onClick={() => setCheckoutOpen(true)} className="flex w-full items-center justify-between gap-3 rounded-md border-2 border-[#07235f] px-4 py-3 text-left text-lg font-bold text-[#07235f]">
          <span className="flex items-center gap-3">
            <Store size={28} />
            Có sản phẩm này tại cửa hàng
          </span>
          <span className="text-2xl">+</span>
        </button>

        <div className="grid gap-4 text-lg text-slate-950 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: Truck, title: "Freeship đơn", text: "từ 66K" },
            { icon: BadgeCheck, title: "Kiểm hàng", text: "trước khi nhận" },
            { icon: CreditCard, title: "Thanh toán", text: "COD" },
            { icon: RefreshCcw, title: "Đổi hàng", text: "trong 7 ngày" }
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#07235f] text-[#07235f]">
                <item.icon size={22} />
              </span>
              <p>
                <span className="block">{item.title}</span>
                <span className="block">{item.text}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-[80] bg-white">
          <form onSubmit={submit} className="flex h-full flex-col">
            <div className="border-b border-slate-200 bg-white">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
                <div>
                  <p className="text-sm text-slate-500">Trang chủ / Sản phẩm / Giỏ hàng</p>
                  <h2 className="mt-1 text-2xl font-bold text-brand-900 sm:text-3xl">Thông tin đơn hàng</h2>
                </div>
                <button type="button" onClick={() => setCheckoutOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-brand-900">
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_470px]">
                <section>
                  <div className="grid gap-4">
                    <input required className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Họ và tên" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
                    <input required className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Số điện thoại" value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} />
                    <input required className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Địa chỉ" value={form.customerAddress} onChange={(event) => setForm({ ...form, customerAddress: event.target.value })} />
                    <div className="grid gap-4 md:grid-cols-3">
                      <select className="min-h-14 rounded-md border-slate-300 text-lg" value={form.province} onChange={(event) => setForm({ ...form, province: event.target.value, district: "", ward: "" })}>
                        <option value="">Chọn tỉnh/thành phố</option>
                        {VIETNAM_PROVINCES.map((province) => (
                          <option key={province}>{province}</option>
                        ))}
                      </select>
                      <select className="min-h-14 rounded-md border-slate-300 text-lg" value={form.district} onChange={(event) => setForm({ ...form, district: event.target.value })}>
                        <option value="">Chọn Quận/huyện</option>
                        {form.province === "Thành phố Hồ Chí Minh" ? <option>Bình Tân</option> : null}
                        <option>Khu vực khác</option>
                      </select>
                      <select className="min-h-14 rounded-md border-slate-300 text-lg" value={form.ward} onChange={(event) => setForm({ ...form, ward: event.target.value })}>
                        <option value="">Chọn Phường/xã</option>
                        {form.province === "Thành phố Hồ Chí Minh" ? <option>Bình Hưng Hòa B</option> : null}
                        <option>Phường/xã khác</option>
                      </select>
                    </div>
                    <input className="min-h-14 rounded-md border-slate-300 text-lg" placeholder="Ví dụ: giao hàng giờ hành chính" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
                  </div>

                  <div className="mt-7 space-y-5">
                    <div>
                      <h3 className="text-2xl font-bold text-brand-900">Phương thức vận chuyển</h3>
                      <div className="mt-3 flex items-center gap-3 rounded-md border-2 border-brand-700 p-5 text-lg">
                        <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-brand-700">
                          <span className="h-3 w-3 rounded-full bg-brand-700" />
                        </span>
                        <Truck size={30} className="text-brand-700" />
                        Freeship đơn hàng
                      </div>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-brand-900">Hình thức thanh toán</h3>
                      <div className="mt-3 overflow-hidden rounded-md border-2 border-brand-700">
                        <div className="flex items-center gap-3 p-5 text-lg">
                          <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-brand-700">
                            <span className="h-3 w-3 rounded-full bg-brand-700" />
                          </span>
                          <span className="rounded-md bg-brand-900 px-3 py-2 font-bold text-white">COD</span>
                          Thanh toán khi giao hàng
                        </div>
                        <div className="border-t border-slate-200 bg-brand-50 p-4 leading-7 text-slate-700">
                          <p>- Khách hàng được kiểm tra hàng trước khi nhận.</p>
                          <p>- Shop gọi hoặc nhắn Zalo xác nhận trước khi giao.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <div className="mb-4 flex items-center gap-3">
                    <ShoppingCart size={34} className="text-brand-700" />
                    <div>
                      <h3 className="text-3xl font-bold text-brand-900">Giỏ hàng</h3>
                      <a href={`tel:${phone}`} className="mt-1 inline-block text-sm font-bold text-brand-700">
                        Cần hỗ trợ? Gọi {phone}
                      </a>
                    </div>
                  </div>
                  {saved > 0 ? <div className="mb-4 rounded-md bg-brand-700 p-4 text-lg font-bold text-white">Bạn được giảm {formatCurrency(saved)} khi mua combo {form.quantity} set</div> : null}

                  <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-[130px_1fr] gap-4">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-brand-50">
                        {product.imageUrl ? <Image src={product.imageUrl} alt={product.name} fill sizes="160px" className="object-cover" /> : null}
                      </div>
                      <div>
                        <p className="line-clamp-2 text-xl font-bold text-brand-900">{product.name}</p>
                        {product.productCode ? <p className="mt-1 text-sm font-bold text-slate-500">Mã {product.productCode}</p> : null}
                        <p className="mt-2 inline-flex rounded-md border border-red-300 px-2 py-1 text-sm font-bold text-red-500">Đổi ý 7 ngày</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <select className="min-h-11 rounded-md border-slate-200" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })}>
                            {colors.map((color) => (
                              <option key={color}>{color}</option>
                            ))}
                          </select>
                          <select className="min-h-11 rounded-md border-slate-200" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })}>
                            {sizes.map((size) => (
                              <option key={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-200">
                            <button type="button" onClick={() => updateQuantity(form.quantity - 1)} className="grid h-10 w-12 place-items-center text-brand-700">
                              <Minus size={18} />
                            </button>
                            <span className="grid h-10 min-w-12 place-items-center font-bold">{form.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(form.quantity + 1)} className="grid h-10 w-12 place-items-center text-brand-700">
                              <Plus size={18} />
                            </button>
                          </div>
                          <p className="text-xl font-bold text-brand-900">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

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
                      <button disabled={loading} className="mt-4 w-full rounded-md bg-brand-700 px-5 py-4 text-xl font-bold text-white disabled:opacity-60">
                        {loading ? "Đang đặt hàng..." : "Thanh toán"}
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
