import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type ProductCardProps = {
  product: {
    productCode?: string;
    name: string;
    slug: string;
    shortDescription?: string | null;
    originalPrice: number;
    salePrice: number;
    status: string;
    isHot: boolean;
    media?: { mediaUrl: string; mediaType: string; isMain: boolean; altText?: string | null }[];
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = product.media?.find((item) => item.isMain && item.mediaType === "IMAGE") ?? product.media?.find((item) => item.mediaType === "IMAGE");
  const hoverImage = product.media?.filter((item) => item.mediaType === "IMAGE").find((item) => item.mediaUrl !== image?.mediaUrl);
  const video = product.media?.find((item) => item.mediaType === "VIDEO");
  const discount = product.originalPrice > product.salePrice ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100) : 0;

  return (
    <Link href={`/san-pham/${product.slug}`} className="group block overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
        {image ? (
          <>
            <Image src={image.mediaUrl} alt={image.altText ?? product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105 group-hover:opacity-0" />
            {hoverImage ? (
              <Image src={hoverImage.mediaUrl} alt={hoverImage.altText ?? product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover opacity-0 transition duration-500 group-hover:scale-105 group-hover:opacity-100" />
            ) : null}
          </>
        ) : video ? (
          <video src={video.mediaUrl} muted playsInline preload="metadata" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center text-sm text-brand-700">Chưa có ảnh</div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount ? <span className="rounded-md bg-brand-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm">-{discount}%</span> : null}
          {product.isHot ? <span className="rounded-md bg-gold px-2.5 py-1 text-xs font-bold text-brand-900 shadow-sm">HOT</span> : null}
        </div>
        <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-brand-700 shadow-sm transition group-hover:bg-brand-700 group-hover:text-white">
          <Heart size={18} />
        </span>
        {product.productCode ? <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs font-bold text-brand-900 shadow-sm">Mã {product.productCode}</span> : null}
      </div>
      <div className="p-4">
        <p className="line-clamp-2 min-h-12 font-bold leading-6 text-brand-900">{product.name}</p>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-bold text-brand-700">{formatCurrency(product.salePrice)}</span>
          {product.originalPrice > product.salePrice ? <span className="text-sm text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span> : null}
        </div>
        <p className="mt-2 line-clamp-1 text-sm text-slate-500">{product.shortDescription}</p>
        <p className={product.status === "ACTIVE" ? "mt-3 text-sm font-bold text-green-700" : "mt-3 text-sm font-bold text-red-600"}>
          {product.status === "ACTIVE" ? "Còn hàng" : "Hết hàng"}
        </p>
        <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-900 px-3 py-3 text-sm font-bold text-white transition group-hover:bg-brand-700">
          <ShoppingBag size={17} />
          Xem sản phẩm
        </div>
      </div>
    </Link>
  );
}
