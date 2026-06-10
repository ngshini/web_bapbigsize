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
        <h3 className="font-bold">Biến thể size/màu/tồn kho</h3>
        <button
          type="button"
          className="rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white"
          onClick={() => setVariants([...variants, { size: "", color: "", sku: "", price: 199000, stockQuantity: 0, isActive: true }])}
        >
          Thêm biến thể
        </button>
      </div>
      {variants.map((variant, index) => (
        <div key={index} className="grid gap-2 rounded-md border p-3 sm:grid-cols-2 lg:grid-cols-6">
          <input placeholder="Size" value={variant.size} onChange={(e) => update(index, "size", e.target.value)} />
          <input placeholder="Màu" value={variant.color} onChange={(e) => update(index, "color", e.target.value)} />
          <input placeholder="SKU" value={variant.sku} onChange={(e) => update(index, "sku", e.target.value)} />
          <input type="number" placeholder="Giá" value={variant.price} onChange={(e) => update(index, "price", Number(e.target.value))} />
          <input type="number" placeholder="Tồn" value={variant.stockQuantity} onChange={(e) => update(index, "stockQuantity", Number(e.target.value))} />
          <button type="button" className="rounded-md border px-3 py-2" onClick={() => setVariants(variants.filter((_, current) => current !== index))}>
            Xóa
          </button>
        </div>
      ))}
    </div>
  );
}
