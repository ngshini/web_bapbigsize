"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/generateSlug";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { VariantEditor } from "@/components/admin/VariantEditor";

type Category = { id: string; name: string };
type ProductMediaInput = {
  id?: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  color?: string;   
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
  const [media, setMedia] = useState<ProductMediaInput[]>(product?.media ?? []);
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
    if (response.ok) router.push("/admin/products");
    else alert((await response.json()).error ?? "Không thể lưu sản phẩm");
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-md bg-white p-3 shadow-sm sm:p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Tên sản phẩm
          <input
            value={base.name}
            onChange={(event) => {
              update("name", event.target.value);
              if (!base.slug) update("slug", generateSlug(event.target.value));
            }}
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Mã sản phẩm
          <input value={base.productCode} onChange={(event) => update("productCode", event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Slug
          <input value={base.slug} onChange={(event) => update("slug", event.target.value)} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Danh mục
          <select value={base.categoryId} onChange={(event) => update("categoryId", event.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Giá gốc
          <input type="number" value={base.originalPrice} onChange={(event) => update("originalPrice", Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Giá khuyến mãi
          <input type="number" value={base.salePrice} onChange={(event) => update("salePrice", Number(event.target.value))} />
        </label>
      </div>
      <input placeholder="Mô tả ngắn" value={base.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} />
      <textarea rows={6} placeholder="Mô tả chi tiết" value={base.description} onChange={(event) => update("description", event.target.value)} />
      <input placeholder="Chất liệu" value={base.material} onChange={(event) => update("material", event.target.value)} />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={base.isHot} onChange={(event) => update("isHot", event.target.checked)} />
          Sản phẩm hot
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={base.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} />
          Sản phẩm nổi bật
        </label>
        <select className="min-h-11 w-full sm:w-auto" value={base.status} onChange={(event) => update("status", event.target.value)}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
        </select>
      </div>
      <input placeholder="SEO title" value={base.seoTitle} onChange={(event) => update("seoTitle", event.target.value)} />
      <textarea rows={3} placeholder="SEO description" value={base.seoDescription} onChange={(event) => update("seoDescription", event.target.value)} />
      <MediaUploader media={media} setMedia={setMedia} />
      <VariantEditor variants={variants} setVariants={setVariants} />
      <div className="space-y-2">
        <h3 className="font-bold">Khuyến mãi</h3>
        {promotions.map((promo, index) => (
          <div key={index} className="grid gap-2 rounded-md border p-2 md:grid-cols-4">
            <input value={promo.name} onChange={(e) => setPromotions(promotions.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)))} />
            <input type="number" value={promo.minQuantity} onChange={(e) => setPromotions(promotions.map((p, i) => (i === index ? { ...p, minQuantity: Number(e.target.value) } : p)))} />
            <input type="number" value={promo.finalPrice} onChange={(e) => setPromotions(promotions.map((p, i) => (i === index ? { ...p, finalPrice: Number(e.target.value) } : p)))} />
            <button type="button" className="rounded-md border px-3 py-2" onClick={() => setPromotions(promotions.filter((_, i) => i !== index))}>
              Xóa
            </button>
          </div>
        ))}
      </div>
      <button className="w-full rounded-md bg-brand-700 px-5 py-3 font-bold text-white sm:w-auto">Lưu sản phẩm để cập nhật website</button>
    </form>
  );
}
