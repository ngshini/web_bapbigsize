import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, MapPin, MessageCircle, PackageCheck, PhoneCall, RefreshCcw, Ruler, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProductCard } from "@/components/public/ProductCard";
import { SizeGuide } from "@/components/public/SizeGuide";
import { getProducts, getSizeGuideImage, getSizeGuides, getStoreSettings } from "@/lib/data";
import { formatCurrency } from "@/lib/formatCurrency";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [store, products, guides, sizeImage] = await Promise.all([getStoreSettings(), getProducts(), getSizeGuides(), getSizeGuideImage()]);
  const featuredProduct = products[0];
  const heroImage = featuredProduct?.media?.find((item) => item.isMain && item.mediaType === "IMAGE")?.mediaUrl ?? featuredProduct?.media?.find((item) => item.mediaType === "IMAGE")?.mediaUrl;
  const bestPromotion = featuredProduct?.promotions?.sort((a, b) => b.minQuantity - a.minQuantity)[0];

  return (
    <>
      <Header store={store} />
      <main>
        <section className="border-b border-brand-100 bg-white">
          <div className="mx-auto grid max-w-6xl gap-2 px-4 py-2 text-xs font-semibold text-brand-900 sm:grid-cols-3 sm:text-sm">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-brand-700" />
              Giao hàng toàn quốc
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-brand-700" />
              Kiểm hàng trước khi nhận
            </div>
            <div className="flex items-center gap-2">
              <RefreshCcw size={16} className="text-brand-700" />
              Đổi trả lỗi trong 7 ngày
            </div>
          </div>
        </section>

        <section className="bg-brand-50">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1fr_0.92fr] md:items-center md:py-12">
            <div className="order-2 md:order-1">
              <p className="mb-3 inline-flex items-center gap-2 rounded-md bg-white px-3 py-1 text-sm font-bold text-brand-700 shadow-sm">
                <ShoppingBag size={16} />
                Bắp Bigsize chính hãng
              </p>
              <h1 className="max-w-2xl text-3xl font-bold leading-tight text-brand-900 sm:text-4xl md:text-5xl">Set Đồ bộ thiết kế cao cấp</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-brand-900/80 sm:text-lg">
                {store.storeName} chuyên đồ bộ nữ form 45-85kg, chất thun co giãn, màu dễ phối, phù hợp đi làm, đi chơi và mặc hằng ngày.
              </p>
              <div className="mt-5 grid max-w-xl gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-white p-3 shadow-sm">
                  <p className="text-sm text-slate-500">Giá từ</p>
                  <p className="text-xl font-bold text-brand-700">{featuredProduct ? formatCurrency(featuredProduct.salePrice) : "199.000 đ"}</p>
                </div>
                <div className="rounded-md bg-white p-3 shadow-sm">
                  <p className="text-sm text-slate-500">Size</p>
                  <p className="text-xl font-bold text-brand-900">45-85kg</p>
                </div>
                <div className="rounded-md bg-white p-3 shadow-sm">
                  <p className="text-sm text-slate-500">Mã hot</p>
                  <p className="text-xl font-bold text-brand-900">{featuredProduct?.productCode ?? "H01"}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/san-pham" className="rounded-md bg-brand-700 px-5 py-3 text-center font-bold text-white">
                  Xem sản phẩm
                </Link>
                {featuredProduct ? (
                  <Link href={`/san-pham/${featuredProduct.slug}`} className="rounded-md border border-brand-300 bg-white px-5 py-3 text-center font-bold text-brand-700">
                    Đặt mẫu {featuredProduct.productCode}
                  </Link>
                ) : null}
                <a href={`tel:${store.phone}`} className="inline-flex items-center justify-center gap-2 rounded-md border border-brand-300 bg-white px-5 py-3 font-bold text-brand-700">
                  <PhoneCall size={18} />
                  {store.phone}
                </a>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <Link href={featuredProduct ? `/san-pham/${featuredProduct.slug}` : "/san-pham"} className="group block overflow-hidden rounded-md bg-white p-3 shadow-soft">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-brand-100">
                  {heroImage ? <Image src={heroImage} alt={featuredProduct?.name ?? "Đồ bộ nữ bigsize"} fill priority sizes="(max-width: 768px) 100vw, 520px" className="object-cover transition duration-300 group-hover:scale-105" /> : null}
                  <div className="absolute left-3 top-3 rounded-md bg-gold px-3 py-2 text-sm font-bold text-brand-900">Best seller</div>
                </div>
                {featuredProduct ? (
                  <div className="grid gap-3 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-brand-700">Mã {featuredProduct.productCode}</p>
                      <p className="font-bold text-brand-900">{featuredProduct.name}</p>
                    </div>
                    <p className="text-xl font-bold text-brand-700">{formatCurrency(featuredProduct.salePrice)}</p>
                  </div>
                ) : null}
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-3 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Ruler, title: "Form bigsize", text: "Tư vấn size theo cân nặng 45-85kg" },
            { icon: BadgeCheck, title: "Hàng kiểm kỹ", text: "Đường may và chất vải được chọn lọc" },
            { icon: PackageCheck, title: "Đóng gói nhanh", text: "Chốt đơn, xác nhận và gửi hàng gọn" },
            { icon: ShieldCheck, title: "Mua an tâm", text: "Được kiểm hàng, hỗ trợ đổi lỗi" }
          ].map((policy) => (
            <div key={policy.title} className="rounded-md bg-white p-4 shadow-sm">
              <policy.icon size={22} className="text-brand-700" />
              <p className="mt-3 font-bold text-brand-900">{policy.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{policy.text}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Sản phẩm đang bán</p>
              <h2 className="text-2xl font-bold text-brand-900">Chọn mẫu, chọn size, đặt hàng ngay</h2>
            </div>
            <Link href="/san-pham" className="text-sm font-bold text-brand-700">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {featuredProduct && bestPromotion ? (
          <section className="bg-white">
            <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Ưu đãi hôm nay</p>
                <h2 className="mt-2 text-2xl font-bold text-brand-900">Mua nhiều tiết kiệm hơn</h2>
                <p className="mt-3 leading-7 text-slate-600">
                  Mẫu {featuredProduct.productCode} có combo {bestPromotion.minQuantity} set chỉ còn {formatCurrency(bestPromotion.finalPrice)}. Shop xác nhận size, màu và địa chỉ trước khi gửi.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {featuredProduct.promotions.map((promotion) => (
                  <Link key={promotion.id} href={`/san-pham/${featuredProduct.slug}`} className="rounded-md border border-brand-100 bg-brand-50 p-4 transition hover:border-brand-300 hover:bg-white">
                    <p className="font-bold text-brand-900">{promotion.name}</p>
                    <p className="mt-2 text-xl font-bold text-brand-700">{formatCurrency(promotion.finalPrice)}</p>
                    <p className="mt-1 text-sm text-slate-600">Đặt combo</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["1", "Chọn mẫu", "Xem ảnh thật, mã hàng, giá và bảng size."],
              ["2", "Điền thông tin", "Chọn size, màu, số lượng và địa chỉ nhận hàng."],
              ["3", "Shop xác nhận", "Nhân viên gọi hoặc nhắn Zalo xác nhận trước khi giao."]
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-md bg-white p-5 shadow-sm">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-700 font-bold text-white">{step}</span>
                <p className="mt-4 font-bold text-brand-900">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <SizeGuide guides={guides} imageUrl={sizeImage} />

        <section id="lien-he" className="bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="overflow-hidden rounded-md bg-brand-900 shadow-soft">
              <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                <div className="p-6 text-white md:p-8">
                  <div className="flex items-center gap-4">
                    {store.logoUrl ? (
                      <Image src={store.logoUrl} alt={store.storeName} width={96} height={96} className="h-20 w-20 rounded-md bg-white object-cover p-1" />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-md bg-white text-2xl font-bold text-brand-700">BB</div>
                    )}
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide text-gold">Tư vấn và đặt hàng</p>
                      <h2 className="mt-1 text-2xl font-bold leading-tight md:text-3xl">Liên hệ shop Bắp Bigsize</h2>
                    </div>
                  </div>

                  <p className="mt-5 max-w-xl text-base leading-7 text-brand-50">
                    Gửi mã sản phẩm, cân nặng, chiều cao và màu muốn đặt. Shop tư vấn size, xác nhận tồn kho và chốt địa chỉ trước khi giao.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <a href={`tel:${store.phone}`} className="rounded-md bg-white px-5 py-4 text-brand-900 transition hover:bg-brand-50">
                      <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-brand-700">
                        <PhoneCall size={20} />
                        Gọi ngay
                      </span>
                      <span className="mt-3 block text-3xl font-bold text-brand-900">{store.phone}</span>
                    </a>
                    <a href={store.zaloUrl || `https://zalo.me/${store.phone}`} className="rounded-md bg-gold px-5 py-4 text-brand-900 transition hover:bg-yellow-300">
                      <span className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide">
                        <MessageCircle size={20} />
                        Nhắn Zalo
                      </span>
                      <span className="mt-3 block text-3xl font-bold">Bắp Bigsize</span>
                    </a>
                  </div>

                  <div className="mt-6 grid gap-3 text-sm text-brand-50 sm:grid-cols-3">
                    <div className="rounded-md bg-white/10 p-3">
                      <p className="font-bold text-white">Kiểm hàng</p>
                      <p className="mt-1">Được xem hàng trước khi nhận</p>
                    </div>
                    <div className="rounded-md bg-white/10 p-3">
                      <p className="font-bold text-white">Đổi lỗi</p>
                      <p className="mt-1">Hỗ trợ 1 đổi 1 trong 7 ngày</p>
                    </div>
                    <div className="rounded-md bg-white/10 p-3">
                      <p className="font-bold text-white">Giao hàng</p>
                      <p className="mt-1">Giao toàn quốc, xác nhận trước</p>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-50 p-6 md:p-8">
                  <div className="h-full rounded-md bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-brand-700 text-white">
                        <MapPin size={28} />
                      </span>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Địa chỉ shop</p>
                        <p className="mt-3 text-2xl font-bold leading-9 text-brand-900">{store.address}</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-md border border-brand-100 bg-brand-50 p-4">
                      <p className="font-bold text-brand-900">Trước khi ghé shop</p>
                      <p className="mt-2 leading-7 text-slate-600">Bạn nên gọi hoặc nhắn Zalo trước để shop giữ mẫu, tư vấn size và báo thời gian nhận hàng phù hợp.</p>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <a href={`tel:${store.phone}`} className="flex-1 rounded-md bg-brand-700 px-5 py-3 text-center font-bold text-white">
                        Gọi shop
                      </a>
                      <a href={store.zaloUrl || `https://zalo.me/${store.phone}`} className="flex-1 rounded-md border border-brand-200 bg-white px-5 py-3 text-center font-bold text-brand-700">
                        Nhắn Zalo
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer store={store} />
    </>
  );
}
