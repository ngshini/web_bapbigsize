"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BadgeCheck, CreditCard, Minus, Plus, RefreshCcw, Ruler, Store, Truck } from "lucide-react";

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

export function BuyNowCheckout({ product, variants, phone: _phone, colorImageMap = {}, selectedColor: controlledColor, onColorChange }: BuyNowCheckoutProps) {
  const activeVariants = variants.filter((variant) => variant.isActive);
  // Gộp trùng theo giá trị đã chuẩn hoá (bỏ dấu cách thừa, không phân biệt hoa/thường)
  // để tránh hiện 2 nút giống nhau (vd "M" và "M ").
  const dedupe = (values: (string | null | undefined)[]) =>
    Array.from(
      new Map(
        values
          .filter((v): v is string => typeof v === "string" && v.trim() !== "")
          .map((v) => [v.trim().toUpperCase(), v.trim()])
      ).values()
    );
  const colors = dedupe(activeVariants.map((variant) => variant.color));
  const sizes = dedupe(activeVariants.map((variant) => variant.size));
  const router = useRouter();
  const [form, setForm] = useState({
    size: sizes[0] ?? "",
    color: controlledColor ?? colors[0] ?? "",
    quantity: 1
  });

  // Sync khi controlledColor thay đổi từ bên ngoài
  const currentColor = controlledColor ?? form.color;

  function handleColorChange(color: string) {
    setForm((prev) => ({ ...prev, color }));
    onColorChange?.(color);
  }
  const [cartMessage, setCartMessage] = useState("");

  function updateQuantity(nextQuantity: number) {
    setForm((current) => ({ ...current, quantity: Math.max(1, Math.min(99, nextQuantity)) }));
  }

  // Thêm sản phẩm đang chọn vào giỏ (localStorage). Trả về true nếu thành công.
  function addItemToCart() {
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
  }

  function addToCart() {
    addItemToCart();
    setCartMessage("Đã thêm vào giỏ hàng");
  }

  // "Mua ngay": thêm vào giỏ rồi chuyển sang trang giỏ hàng (có header đầy đủ)
  function buyNow() {
    addItemToCart();
    router.push("/gio-hang");
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
  onClick={buyNow}
  className="h-16 w-full rounded-md bg-pink-600 px-6 text-xl font-bold uppercase tracking-wide text-white transition hover:bg-pink-700"
>
  Mua ngay
</button>

        <button type="button" onClick={buyNow} className="flex w-full items-center justify-between gap-3 rounded-md border-2 border-[#07235f] px-4 py-3 text-left text-lg font-bold text-[#07235f]">
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

    </>
  );
}
