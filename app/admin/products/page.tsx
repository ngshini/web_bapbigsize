import { ProductStatus } from "@prisma/client";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductStatusControl } from "@/components/admin/ProductStatusControl";
import { formatCurrency } from "@/lib/formatCurrency";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const q = params.q;
  const status = params.status;
  const products = await prisma.product
    .findMany({
      where: {
        ...(status ? { status: status as ProductStatus } : {}),
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { productCode: { contains: q, mode: "insensitive" } }] } : {})
      },
      orderBy: { createdAt: "desc" },
      include: { media: true }
    })
    .catch(() => []);

  return (
    <AdminLayout>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Sản phẩm</h1>
        <Link href="/admin/products/create" className="rounded-md bg-brand-700 px-4 py-2 font-bold text-white">
          Thêm sản phẩm
        </Link>
      </div>
      <form className="mt-5 grid gap-3 rounded-md bg-white p-3 sm:grid-cols-3 sm:p-4">
        <input name="q" placeholder="Tìm tên hoặc mã sản phẩm" defaultValue={q ?? ""} />
        <select name="status" defaultValue={status ?? ""}>
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang bán</option>
          <option value="INACTIVE">Đã ẩn</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
        </select>
        <button className="rounded-md bg-slate-900 px-4 py-3 font-bold text-white sm:py-2">Lọc</button>
      </form>
      <div className="-mx-3 mt-5 overflow-x-auto rounded-md bg-white sm:mx-0">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3">Mã</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-3">{product.productCode}</td>
                <td className="p-3 font-semibold">{product.name}</td>
                <td className="p-3">{formatCurrency(product.salePrice)}</td>
                <td className="p-3">
                  <ProductStatusControl productId={product.id} initialStatus={product.status} />
                </td>
                <td className="flex gap-2 p-3">
                  <Link className="rounded-md border px-2 py-1" href={`/san-pham/${product.slug}`}>
                    Xem
                  </Link>
                  <Link className="rounded-md border px-2 py-1" href={`/admin/products/${product.id}/edit`}>
                    Sửa
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
