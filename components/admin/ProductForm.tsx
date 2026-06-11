"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/generateSlug";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { VariantEditor } from "@/components/admin/VariantEditor";
import { Package, Tag, FileText, Settings, Search, Image, Layers, Gift, Save, Trash2 } from "lucide-react";

type Category = { id: string; name: string };
type ProductMediaInput = {
  id?: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  altText?: string | null;
  isMain: boolean;
  sortOrder: number;
  storagePath?: string | null;
  originalFileName?: string | null;
};
type VariantInput = {
  id?: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stockQuantity: number;
  isActive: boolean;
};
type PromotionInput = {
  id?: string;
  name: string;
  minQuantity: number;
  finalPrice: number;
  discountAmount: number;
  isActive: boolean;
};
type ProductInput = {
  id: string;
  name: string;
  productCode: string;
  slug: string;
  categoryId: string;
  shortDescription?: string | null;
  description?: string | null;
  material?: string | null;
  originalPrice: number;
  salePrice: number;
  status: string;
  isHot: boolean;
  isFeatured: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  media: ProductMediaInput[];
  variants: VariantInput[];
  promotions: PromotionInput[];
};
type ProductFormProps = {
  categories: Category[];
  product?: ProductInput;
  mode: "create" | "edit";
};

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
      <Icon size={18} className="text-brand-700" />
      <h3 className="text-sm font-bold uppercase tracking-wide text-brand-900">{title}</h3>
    </div>
  );
}

function FieldLabel({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export function ProductForm({ categories, product, mode }: ProductFormProps) {
  const router = useRouter();
  const [base, setBase] = useState({
    name: product?.name ?? "",
    productCode: product?.productCode ?? "",
    slug: product?.slug ?? "",
    categoryId: product?.categoryId ?? categories[0]?.id ?? "",
    shortDescription: product?.shortDescription ?? "",
    description: product?.description ?? "",
    material: product?.material ?? "",
    originalPrice: product?.originalPrice ?? 250000,
    salePrice: product?.salePrice ?? 199000,
    status: product?.status ?? "ACTIVE",
    isHot: product?.isHot ?? false,
    isFeatured: product?.isFeatured ?? false,
    seoTitle: product?.seoTitle ?? "",
    seoDescription: product?.seoDescription ?? ""
  });
  const [variants, setVariants] = useState<VariantInput[]>(product?.variants ?? []);
  const [media, setMedia] = useState<ProductMediaInput[]>(() => {
    // Deduplicate theo URL để tránh hiển thị bản trùng từ DB
    const seen = new Set<string>();
    return (product?.media ?? []).filter((item) => {
      if (seen.has(item.mediaUrl)) return false;
      seen.add(item.mediaUrl);
      return true;
    });
  });
  const [promotions, setPromotions] = useState<PromotionInput[]>(product?.promotions ?? [
    { name: "Mua 1 set", minQuantity: 1, finalPrice: 199000, discountAmount: 51000, isActive: true },
    { name: "Mua 2 set", minQuantity: 2, finalPrice: 378000, discountAmount: 122000, isActive: true },
    { name: "Mua 3 set", minQuantity: 3, finalPrice: 557000, discountAmount: 193000, isActive: true }
  ]);
  const endpoint = useMemo(() => (mode === "edit" && product ? `/api/admin/products/${product.id}` : "/api/admin/products"), [mode, product]);

  function update(key: keyof typeof base, value: string | number | boolean) {
    setBase((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(endpoint, {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...base, variants, media, promotions })
    });
    if (response.ok) {
      router.push("/admin/products");
    } else {
      let msg = "Không thể lưu sản phẩm";
      try {
        const data = await response.json();
        msg = data.error ?? msg;
      } catch {}
      alert(msg);
    }
  }

  const discount = base.originalPrice > base.salePrice
    ? Math.round(((base.originalPrice - base.salePrice) / base.originalPrice) * 100)
    : 0;

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* === THÔNG TIN CƠ BẢN === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Package} title="Thông tin cơ bản" />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FieldLabel label="Tên sản phẩm" required>
            <input
              required
              className="min-h-12 text-base"
              placeholder="VD: Set bộ thiết kế cao cấp"
              value={base.name}
              onChange={(event) => {
                update("name", event.target.value);
                if (!base.slug) update("slug", generateSlug(event.target.value));
              }}
            />
          </FieldLabel>
          <FieldLabel label="Mã sản phẩm" required>
            <input
              required
              className="min-h-12 text-base"
              placeholder="VD: H01, H02..."
              value={base.productCode}
              onChange={(event) => update("productCode", event.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="Slug (đường dẫn URL)">
            <input
              className="min-h-12 text-base text-slate-500"
              placeholder="Tự tạo từ tên sản phẩm"
              value={base.slug}
              onChange={(event) => update("slug", event.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="Danh mục">
            <select className="min-h-12 text-base" value={base.categoryId} onChange={(event) => update("categoryId", event.target.value)}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
      </div>

      {/* === GIÁ BÁN === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Tag} title="Giá bán" />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <FieldLabel label="Giá gốc (đ)" required>
            <input
              type="number"
              required
              className="min-h-12 text-lg font-semibold"
              value={base.originalPrice}
              onChange={(event) => update("originalPrice", Number(event.target.value))}
            />
          </FieldLabel>
          <FieldLabel label="Giá khuyến mãi (đ)" required>
            <input
              type="number"
              required
              className="min-h-12 text-lg font-semibold text-brand-700"
              value={base.salePrice}
              onChange={(event) => update("salePrice", Number(event.target.value))}
            />
          </FieldLabel>
          <div className="flex items-end">
            {discount > 0 && (
              <div className="rounded-md bg-green-50 px-4 py-3 text-center">
                <p className="text-xs text-green-600">Giảm giá</p>
                <p className="text-2xl font-bold text-green-700">{discount}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === MÔ TẢ === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={FileText} title="Mô tả sản phẩm" />
        <div className="mt-5 space-y-5">
          <FieldLabel label="Mô tả ngắn">
            <input
              className="min-h-12 text-base"
              placeholder="VD: Set bộ thiết kế cổ trụ thêu gấu, chất thun co giãn, form 45-85kg"
              value={base.shortDescription}
              onChange={(event) => update("shortDescription", event.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="Mô tả chi tiết">
            <textarea
              rows={5}
              className="text-base leading-7"
              placeholder="Mô tả đầy đủ về sản phẩm, chất liệu, cách bảo quản..."
              value={base.description}
              onChange={(event) => update("description", event.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="Chất liệu">
            <input
              className="min-h-12 text-base"
              placeholder="VD: Thun tăm QC cao cấp"
              value={base.material}
              onChange={(event) => update("material", event.target.value)}
            />
          </FieldLabel>
        </div>
      </div>

      {/* === TRẠNG THÁI === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Settings} title="Trạng thái & hiển thị" />
        <div className="mt-5 flex flex-wrap items-center gap-6">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              checked={base.isHot}
              onChange={(event) => update("isHot", event.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">🔥 Sản phẩm hot</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50">
            <input
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
              checked={base.isFeatured}
              onChange={(event) => update("isFeatured", event.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">⭐ Sản phẩm nổi bật</span>
          </label>
          <FieldLabel label="Trạng thái">
            <select className="min-h-12 text-base font-semibold" value={base.status} onChange={(event) => update("status", event.target.value)}>
              <option value="ACTIVE">✅ Đang bán</option>
              <option value="INACTIVE">⏸ Tạm ẩn</option>
              <option value="OUT_OF_STOCK">❌ Hết hàng</option>
            </select>
          </FieldLabel>
        </div>
      </div>

      {/* === SEO === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Search} title="SEO (tối ưu tìm kiếm Google)" />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <FieldLabel label="Tiêu đề SEO">
            <input
              className="min-h-12 text-base"
              placeholder="VD: Set bộ bigsize nữ 45-85kg | Bắp Bigsize"
              value={base.seoTitle}
              onChange={(event) => update("seoTitle", event.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="Mô tả SEO">
            <textarea
              rows={3}
              className="text-base"
              placeholder="Mô tả hiển thị trên Google (nên dưới 160 ký tự)"
              value={base.seoDescription}
              onChange={(event) => update("seoDescription", event.target.value)}
            />
          </FieldLabel>
        </div>
      </div>

      {/* === ẢNH / VIDEO === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Image} title="Ảnh / video sản phẩm" />
        <div className="mt-5">
          <MediaUploader
            media={media}
            setMedia={setMedia}
            colors={Array.from(new Set(variants.filter(v => v.color).map(v => v.color)))}
          />
        </div>
      </div>

      {/* === BIẾN THỂ === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Layers} title="Biến thể (size, màu, tồn kho)" />
        <div className="mt-5">
          <VariantEditor variants={variants} setVariants={setVariants} />
        </div>
      </div>

      {/* === KHUYẾN MÃI === */}
      <div className="rounded-lg bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={Gift} title="Khuyến mãi combo" />
        <div className="mt-5 space-y-3">
          {promotions.map((promo, index) => (
            <div key={index} className="grid items-end gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_auto_1fr_auto]">
              <FieldLabel label="Tên combo">
                <input
                  className="min-h-11 text-base"
                  placeholder="VD: Mua 2 set"
                  value={promo.name}
                  onChange={(e) => setPromotions(promotions.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)))}
                />
              </FieldLabel>
              <FieldLabel label="Số lượng tối thiểu">
                <input
                  type="number"
                  className="min-h-11 w-24 text-center text-base font-bold"
                  value={promo.minQuantity}
                  onChange={(e) => setPromotions(promotions.map((p, i) => (i === index ? { ...p, minQuantity: Number(e.target.value) } : p)))}
                />
              </FieldLabel>
              <FieldLabel label="Giá combo (đ)">
                <input
                  type="number"
                  className="min-h-11 text-base font-bold text-brand-700"
                  value={promo.finalPrice}
                  onChange={(e) => setPromotions(promotions.map((p, i) => (i === index ? { ...p, finalPrice: Number(e.target.value) } : p)))}
                />
              </FieldLabel>
              <button
                type="button"
                className="flex min-h-11 items-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                onClick={() => setPromotions(promotions.filter((_, i) => i !== index))}
              >
                <Trash2 size={14} />
                Xóa
              </button>
            </div>
          ))}
          <button
            type="button"
            className="rounded-md border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-500 transition hover:border-brand-300 hover:text-brand-700"
            onClick={() => setPromotions([...promotions, { name: "", minQuantity: 1, finalPrice: 0, discountAmount: 0, isActive: true }])}
          >
            + Thêm combo mới
          </button>
        </div>
      </div>

      {/* === NÚT LƯU === */}
      <div className="sticky bottom-0 z-10 -mx-3 flex items-center justify-between rounded-lg border border-brand-100 bg-white px-5 py-4 shadow-lg sm:-mx-0">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          onClick={() => router.push("/admin/products")}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-8 py-3 font-bold text-white transition hover:bg-brand-900"
        >
          <Save size={18} />
          Lưu sản phẩm
        </button>
      </div>
    </form>
  );
}

