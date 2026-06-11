import { AdminLayout } from "@/components/admin/AdminLayout";
import { OrderTable } from "@/components/admin/OrderTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { formatCurrency } from "@/lib/formatCurrency";
import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, Clock, TrendingUp, Crown, Users } from "lucide-react";

export const dynamic = "force-dynamic";

async function getRevenueByDay(days = 7) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true, totalAmount: true }
    });
    const map = new Map<string, number>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + o.totalAmount);
    }
    return Array.from(map.entries()).map(([date, amount]) => ({
      date,
      label: new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      amount
    }));
  } catch {
    return [];
  }
}

async function getTopProducts(limit = 5) {
  try {
    const items = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit
    });
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, productCode: true }
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    return items.map((item) => ({
      product: productMap.get(item.productId),
      totalQty: item._sum.quantity ?? 0,
      totalRevenue: item._sum.subtotal ?? 0
    }));
  } catch {
    return [];
  }
}

async function getTopCustomers(limit = 5) {
  try {
    const customers = await prisma.order.groupBy({
      by: ["customerPhone", "customerName"],
      where: { status: { not: "CANCELLED" } },
      _count: { id: true },
      _sum: { totalAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: limit
    });
    return customers.map((c) => ({
      name: c.customerName,
      phone: c.customerPhone,
      orderCount: c._count.id,
      totalSpent: c._sum.totalAmount ?? 0
    }));
  } catch {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingCount, orders, revenueData, topProducts, topCustomers] = await Promise.all([
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
              product: { select: { productCode: true } }
            }
          }
        }
      })
      .catch(() => []),
    getRevenueByDay(7),
    getTopProducts(5),
    getTopCustomers(5)
  ]);
  const revenue = orders.filter((order) => order.status !== "CANCELLED").reduce((sum, order) => sum + order.totalAmount, 0);

  const stats = [
    { label: "Sản phẩm", value: productCount, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Tổng đơn hàng", value: orderCount, icon: ShoppingCart, color: "text-emerald-600 bg-emerald-50" },
    { label: "Đang chờ xử lý", value: pendingCount, icon: Clock, color: "text-amber-600 bg-amber-50" },
    { label: "Doanh thu", value: formatCurrency(revenue), icon: TrendingUp, color: "text-brand-700 bg-brand-50" }
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats cards */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-md ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
            <p className="mt-3 text-2xl font-bold text-brand-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="mt-8 rounded-md bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-brand-700" />
          <h2 className="font-bold text-brand-900">Doanh thu 7 ngày gần nhất</h2>
        </div>
        <RevenueChart data={revenueData} />
      </div>

      {/* Top Products & Top Customers */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Top sản phẩm */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-amber-500" />
            <h2 className="font-bold text-brand-900">Top sản phẩm bán chạy</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {topProducts.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-orange-50 text-orange-600"}`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-900">{item.product?.name ?? "Sản phẩm đã xóa"}</p>
                      <p className="text-xs text-slate-400">Mã {item.product?.productCode ?? "—"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-700">{item.totalQty} bán</p>
                    <p className="text-xs text-slate-400">{formatCurrency(item.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top khách hàng */}
        <div className="rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-brand-700" />
            <h2 className="font-bold text-brand-900">Khách hàng mua nhiều nhất</h2>
          </div>
          {topCustomers.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="mt-4 divide-y divide-slate-100">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-700">{c.orderCount} đơn</p>
                    <p className="text-xs text-slate-400">{formatCurrency(c.totalSpent)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-8">
        <h2 className="mb-3 font-bold">Đơn mới nhất</h2>
        <OrderTable orders={orders} />
      </div>
    </AdminLayout>
  );
}

