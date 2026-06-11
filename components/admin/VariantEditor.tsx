"use client";

type Variant = {
  size: string;
  color: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};

export function VariantEditor({ variants, setVariants }: { variants: Variant[]; setVariants: (variants: Variant[]) => void }) {
  function update(index: number, key: keyof Variant, value: string | number | boolean) {
    setVariants(variants.map((variant, current) => (current === index ? { ...variant, [key]: value } : variant)));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-bold">Biến thể size / màu / tồn kho</h3>
        <button
          type="button"
          className="rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => setVariants([...variants, { size: "", color: "", sku: "", price: 199000, stockQuantity: 0, isActive: true }])}
        >
          + Thêm biến thể
        </button>
      </div>

      {/* Header cột */}
      {variants.length > 0 && (
        <div className="hidden grid-cols-[1fr_1fr_1.5fr_140px_100px_80px] gap-2 border border-transparent px-3 pb-1 lg:grid">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Size</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Màu sắc</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">SKU (mã biến thể)</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Giá bán (đ)</span>
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Tồn kho</span>
          <span />
        </div>
      )}

      {variants.length === 0 && (
        <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-400">
          Chưa có biến thể nào. Bấm &quot;+ Thêm biến thể&quot; để tạo.
        </p>
      )}

      {variants.map((variant, index) => (
        <div key={index} className="grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr_140px_100px_80px]">
          <input
            className="w-full min-h-10 text-sm"
            placeholder="Size (VD: M, L, XL, 2XL)"
            value={variant.size}
            onChange={(e) => update(index, "size", e.target.value)}
          />
          <input
            className="w-full min-h-10 text-sm"
            placeholder="Màu (VD: Đen, Xám nhạt, Trắng Be)"
            value={variant.color}
            onChange={(e) => update(index, "color", e.target.value)}
          />
          <input
            className="w-full min-h-10 text-sm"
            placeholder="SKU (để trống tự tạo)"
            value={variant.sku}
            onChange={(e) => update(index, "sku", e.target.value)}
          />
          <input
            type="number"
            className="w-full min-h-10 text-sm"
            placeholder="Giá"
            value={variant.price}
            onChange={(e) => update(index, "price", Number(e.target.value))}
          />
          <input
            type="number"
            className="w-full min-h-10 text-sm"
            placeholder="Tồn kho"
            value={variant.stockQuantity}
            onChange={(e) => update(index, "stockQuantity", Number(e.target.value))}
          />
          <button
            type="button"
            className="w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-500 hover:bg-red-50"
            onClick={() => setVariants(variants.filter((_, current) => current !== index))}
          >
            Xóa
          </button>
        </div>
      ))}
    </div>
  );
}
