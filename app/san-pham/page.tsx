import { Search } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProductCard } from "@/components/public/ProductCard";
import { getProducts, getStoreSettings } from "@/lib/data";

export const revalidate = 60;

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const [store, products] = await Promise.all([getStoreSettings(), getProducts()]);
  const size = params.size;
  const color = params.color;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const q = params.q?.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const variants = product.variants ?? [];
    const matchSize = !size || variants.some((v) => v.size === size);
    const matchColor = !color || variants.some((v) => v.color === color);
    const matchPrice = !maxPrice || product.salePrice <= maxPrice;
    const matchSearch = !q || product.name.toLowerCase().includes(q) || (product.productCode ?? "").toLowerCase().includes(q);
    return matchSize && matchColor && matchPrice && matchSearch;
  });

  const sizes = Array.from(new Set(products.flatMap((p) => p.variants?.map((v) => v.size) ?? [])));
  const colors = Array.from(new Set(products.flatMap((p) => p.variants?.map((v) => v.color) ?? [])));

  return (
    <>
      <Header store={store} />
      <main className="bg-white">
        <section className="border-b border-brand-100 bg-brand-50">
          <div className="mx-auto max-w-6xl px-4 py-8">
            <p className="text-sm font-bold uppercase tracking-wide text-brand-700">Bắp Bigsize</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">Tất cả sản phẩm</h1>
                <p className="mt-2 text-slate-600">Đồ bộ nữ bigsize form 45-85kg, ảnh thật, giá rõ ràng.</p>
              </div>
              <p className="font-bold text-brand-700">{filtered.length} sản phẩm</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <form className="grid gap-3 rounded-md border border-brand-100 bg-white p-3 shadow-sm sm:p-4">
            {/* Ô tìm kiếm */}
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q ?? ""}
                placeholder="Tìm theo tên hoặc mã sản phẩm..."
                className="w-full rounded-md border border-slate-200 py-3 pl-10 pr-4 text-sm focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
              />
            </div>
            {/* Bộ lọc */}
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <select name="size" defaultValue={size ?? ""} className="rounded-md border border-slate-200 py-3 px-3 text-sm">
                <option value="">Tất cả size</option>
                {sizes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select name="color" defaultValue={color ?? ""} className="rounded-md border border-slate-200 py-3 px-3 text-sm">
                <option value="">Tất cả màu</option>
                {colors.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select name="maxPrice" defaultValue={params.maxPrice ?? ""} className="rounded-md border border-slate-200 py-3 px-3 text-sm">
                <option value="">Tất cả giá</option>
                <option value="200000">Dưới 200.000đ</option>
                <option value="300000">Dưới 300.000đ</option>
              </select>
              <button className="rounded-md bg-brand-900 px-5 py-3 font-bold text-white text-sm">Lọc</button>
            </div>
          </form>

          {filtered.length === 0 ? (
            <div className="mt-12 flex flex-col items-center gap-3 text-center text-slate-500">
              <Search size={48} className="text-slate-300" />
              <p className="text-lg font-semibold">Không tìm thấy sản phẩm nào</p>
              <p className="text-sm">Thử tìm với từ khóa khác hoặc bỏ bộ lọc</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer store={store} />
    </>
  );
}
