import { notFound } from "next/navigation";
import { PackageCheck } from "lucide-react";
import { BuyNowCheckout } from "@/components/public/BuyNowCheckout";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProductGallery } from "@/components/public/ProductGallery";
import { SizeGuide } from "@/components/public/SizeGuide";
import { formatCurrency } from "@/lib/formatCurrency";
import { getProductBySlug, getSizeGuideImage, getSizeGuides, getStoreSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [store, product, guides, sizeImage] = await Promise.all([getStoreSettings(), getProductBySlug(slug), getSizeGuides(), getSizeGuideImage()]);
  if (!product) notFound();
  const discount = product.originalPrice > product.salePrice ? Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100) : 0;
  const mainImage = product.media?.find((item) => item.isMain && item.mediaType === "IMAGE")?.mediaUrl ?? product.media?.find((item) => item.mediaType === "IMAGE")?.mediaUrl ?? null;

  return (
    <>
      <Header store={store} />
      <main className="bg-white pb-24 sm:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-start lg:py-8">
          <ProductGallery media={product.media ?? []} name={product.name} />

          <section className="lg:sticky lg:top-24">
            <div className="rounded-md border border-brand-100 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                {product.isHot ? <span className="rounded-md bg-gold px-3 py-1 text-sm font-bold text-brand-900">Sản phẩm hot</span> : null}
                {discount ? <span className="rounded-md bg-brand-700 px-3 py-1 text-sm font-bold text-white">Giảm {discount}%</span> : null}
                <span className="rounded-md bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">Mã {product.productCode}</span>
              </div>

              <h1 className="mt-4 text-3xl font-bold leading-tight text-brand-900 sm:text-4xl">{product.name}</h1>
              <p className="mt-3 text-base leading-7 text-slate-600">{product.shortDescription}</p>

              <div className="mt-5 flex flex-wrap items-end gap-3 border-b border-brand-100 pb-5">
                <span className="text-4xl font-bold text-brand-700">{formatCurrency(product.salePrice)}</span>
                {product.originalPrice > product.salePrice ? <span className="text-xl text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span> : null}
              </div>

              <div className="mt-5">
                <BuyNowCheckout
                  product={{
                    id: product.id,
                    productCode: product.productCode,
                    name: product.name,
                    salePrice: product.salePrice,
                    originalPrice: product.originalPrice,
                    imageUrl: mainImage
                  }}
                  variants={product.variants ?? []}
                  phone={store.phone}
                />
              </div>
            </div>
          </section>
        </div>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-md border border-brand-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Chi tiết sản phẩm</p>
            <div className="mt-3 space-y-3 text-base leading-8 text-brand-900">
              <p>{product.description}</p>
              <p>
                <span className="font-bold">Chất liệu:</span> {product.material}
              </p>
              <p>
                <span className="font-bold">Chính sách:</span> Được kiểm tra hàng, được mặc thử, trả lại không mất phí ship nếu không phù hợp, bảo hành lỗi 1 đổi 1 trong vòng 7 ngày.
              </p>
            </div>
          </div>
          <div className="rounded-md border border-brand-100 bg-brand-50 p-5">
            <div className="flex items-center gap-3">
              <PackageCheck size={24} className="text-brand-700" />
              <p className="font-bold text-brand-900">Shop xác nhận trước khi giao</p>
            </div>
            <p className="mt-3 leading-7 text-slate-600">Sau khi đặt hàng, shop sẽ gọi hoặc nhắn Zalo xác nhận lại mã hàng, màu, size, số lượng và địa chỉ của khách.</p>
          </div>
        </section>

        <SizeGuide guides={guides} imageUrl={sizeImage} />
      </main>
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-brand-100 bg-white/95 p-3 shadow-[0_-8px_24px_rgba(190,24,93,0.12)] backdrop-blur sm:hidden">
        <a href={`tel:${store.phone}`} className="rounded-md border border-brand-200 px-4 py-3 text-center font-bold text-brand-700">
          Gọi ngay
        </a>
        <a href={store.zaloUrl || `https://zalo.me/${store.phone}`} className="rounded-md bg-brand-700 px-4 py-3 text-center font-bold text-white">
          Zalo
        </a>
      </div>
      <Footer store={store} />
    </>
  );
}
