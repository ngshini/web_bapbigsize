import { notFound } from "next/navigation";
import { PackageCheck, Gift, ArrowRight } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProductCard } from "@/components/public/ProductCard";
import { ProductDetailClient } from "@/components/public/ProductDetailClient";
import { ProductReviews } from "@/components/public/ProductReviews";
import { SizeGuide } from "@/components/public/SizeGuide";
import { formatCurrency } from "@/lib/formatCurrency";
import { getAllProductSlugs, getProductBySlug, getRelatedProducts, getSizeGuideImage, getSizeGuides, getStoreSettings } from "@/lib/data";
import Link from "next/link";

export const revalidate = 60;
export const preferredRegion = "syd1";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [store, product, guides, sizeImage] = await Promise.all([getStoreSettings(), getProductBySlug(slug), getSizeGuides(), getSizeGuideImage()]);
  if (!product) notFound();
  const relatedProducts = await getRelatedProducts(slug, (product as { categoryId?: string }).categoryId);

  return (
    <>
      <Header store={store} />
      <main className="bg-white pb-24 sm:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-start lg:py-8">
          <ProductDetailClient
            media={product.media ?? []}
            name={product.name}
            product={{
              id: product.id,
              productCode: product.productCode,
              name: product.name,
              salePrice: product.salePrice,
              originalPrice: product.originalPrice,
              shortDescription: product.shortDescription,
              isHot: product.isHot,
            }}
            variants={product.variants ?? []}
            phone={store.phone}
          />
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

        {/* Combo / Upsell */}
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <div className="overflow-hidden rounded-md bg-gradient-to-r from-brand-700 via-brand-900 to-brand-700 p-5 text-white shadow-soft sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/20">
                  <Gift size={24} />
                </div>
                <div>
                  <p className="text-lg font-bold sm:text-xl">Mua thêm set — giảm ngay!</p>
                  <p className="mt-1 text-sm leading-6 text-white/80">
                    Mua 2 set chỉ {formatCurrency(378000)} (tiết kiệm {formatCurrency(199000 * 2 - 378000)}) · Mua 3 set chỉ {formatCurrency(557000)} (tiết kiệm {formatCurrency(199000 * 3 - 557000)})
                  </p>
                </div>
              </div>
              <Link href="/san-pham" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50">
                Xem thêm mẫu
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        <SizeGuide guides={guides} imageUrl={sizeImage} />

        <ProductReviews
          productId={product.id}
          initialReviews={(product.reviews ?? []).map((r) => ({ ...r, createdAt: new Date(r.createdAt).toISOString() }))}
          avgRating={product.reviews?.length ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0}
        />

        {/* Sản phẩm liên quan */}
        {relatedProducts.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Có thể bạn thích</p>
                <h2 className="text-2xl font-bold text-brand-900">Sản phẩm tương tự</h2>
              </div>
              <Link href="/san-pham" className="text-sm font-bold text-brand-700">Xem tất cả</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-brand-100 bg-white p-3 shadow-[0_-8px_24px_rgba(190,24,93,0.12)] sm:hidden">
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
