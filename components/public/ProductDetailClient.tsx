"use client";

import { useState, useMemo } from "react";
import { ProductGallery } from "@/components/public/ProductGallery";
import { BuyNowCheckout } from "@/components/public/BuyNowCheckout";
import { formatCurrency } from "@/lib/formatCurrency";

type Media = {
  id: string;
  mediaUrl: string;
  mediaType: string;
  altText?: string | null;
  isMain?: boolean;
};

type Variant = {
  size: string;
  color: string;
  stockQuantity: number;
  isActive: boolean;
};

type Props = {
  media: Media[];
  name: string;
  product: {
    id: string;
    productCode?: string;
    name: string;
    salePrice: number;
    originalPrice: number;
    shortDescription?: string | null;
    isHot?: boolean;
  };
  variants: Variant[];
  phone: string;
};

export function ProductDetailClient({ media, name, product, variants, phone }: Props) {
  const activeVariants = variants.filter((v) => v.isActive);
  const colors = Array.from(new Set(activeVariants.map((v) => v.color)));
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");

  const discount =
    product.originalPrice > product.salePrice
      ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)
      : 0;

  // Map màu → URL ảnh đầu tiên khớp altText (dùng cho swatch preview)
  const colorImageMap = useMemo(() => {
    const map: Record<string, string | null> = {};
    for (const color of colors) {
      const match = media.find(
        (m) =>
          m.mediaType === "IMAGE" &&
          m.altText &&
          m.altText.toLowerCase().trim() === color.toLowerCase().trim()
      );
      map[color] = match?.mediaUrl ?? null;
    }
    return map;
  }, [colors, media]);

  // ID ảnh đầu tiên của màu đang chọn → truyền vào gallery để nhảy đến ảnh đó
  // Thumbnails vẫn hiển thị đủ tất cả ảnh
  const activeMediaId = useMemo(() => {
    if (!selectedColor) return undefined;
    const match = media.find(
      (m) =>
        m.mediaType === "IMAGE" &&
        m.altText &&
        m.altText.toLowerCase().trim() === selectedColor.toLowerCase().trim()
    );
    return match?.id;
  }, [selectedColor, media]);

  const mainImage =
    media.find((m) => m.isMain && m.mediaType === "IMAGE")?.mediaUrl ??
    media.find((m) => m.mediaType === "IMAGE")?.mediaUrl ??
    null;

  return (
    <>
      <ProductGallery media={media} name={name} activeMediaId={activeMediaId} />

      <section className="lg:sticky lg:top-24">
        <div className="rounded-md border border-brand-100 bg-white p-5 shadow-soft sm:p-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {product.isHot && (
              <span className="rounded-md bg-gold px-3 py-1 text-sm font-bold text-brand-900">
                Sản phẩm hot
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-md bg-brand-700 px-3 py-1 text-sm font-bold text-white">
                Giảm {discount}%
              </span>
            )}
            {product.productCode && (
              <span className="rounded-md bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">
                Mã {product.productCode}
              </span>
            )}
          </div>

          {/* Tên và giá */}
          <h1 className="mt-4 text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">
            {product.name}
          </h1>
          {product.shortDescription && (
            <p className="mt-3 text-base leading-7 text-slate-600">{product.shortDescription}</p>
          )}
          <div className="mt-5 flex flex-wrap items-end gap-3 border-b border-brand-100 pb-5">
            <span className="text-4xl font-bold text-brand-700">
              {formatCurrency(product.salePrice)}
            </span>
            {product.originalPrice > product.salePrice && (
              <span className="text-xl text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Chọn màu/size/đặt hàng */}
          <div className="mt-5">
            <BuyNowCheckout
              product={{
                id: product.id,
                productCode: product.productCode,
                name: product.name,
                salePrice: product.salePrice,
                originalPrice: product.originalPrice,
                imageUrl: mainImage,
              }}
              variants={variants}
              phone={phone}
              colorImageMap={colorImageMap}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
            />
          </div>
        </div>
      </section>
    </>
  );
}

