import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderTable } from "@/components/admin/OrderTable";
import { formatCurrency } from "@/lib/formatCurrency";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingCount, orders] = await Promise.all([
    prisma.product.count().catch(() => 0),
    prisma.order.count().catch(() => 0),
    prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.order
      .findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          items: {
            include: {
              product: {
                select: {
                  productCode: true
                }
              }
            }
          }
        }
      })
      .catch(() => [])
  ]);
  const revenue = orders.filter((order) => order.status !== "CANCELLED").reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Sản phẩm", productCount],
          ["Đơn hàng", orderCount],
          ["Đang chờ", pendingCount],
          ["Doanh thu tạm tính", formatCurrency(revenue)]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-brand-900">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="mb-3 font-bold">Đơn mới nhất</h2>
        <OrderTable orders={orders} />
      </div>
    </AdminLayout>
  );
}
