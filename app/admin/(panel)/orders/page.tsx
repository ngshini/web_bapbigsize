import { OrderStatus } from "@prisma/client";
import { OrderTable } from "@/components/admin/OrderTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const q = params.q;
  const status = params.status;
  const orders = await prisma.order
    .findMany({
      where: {
        ...(status ? { status: status as OrderStatus } : {}),
        ...(q
          ? {
              OR: [
                { orderCode: { contains: q, mode: "insensitive" } },
                { customerName: { contains: q, mode: "insensitive" } },
                { customerPhone: { contains: q } },
                { customerAddress: { contains: q, mode: "insensitive" } },
                { items: { some: { product: { productCode: { contains: q, mode: "insensitive" } } } } },
                { items: { some: { productName: { contains: q, mode: "insensitive" } } } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { email: true } },
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
    .catch(() => []);
  const ordersWithEmail = orders.map((order) => ({ ...order, customerEmail: order.customer?.email ?? null }));
  return (
    <>
      <h1 className="text-2xl font-bold">Đơn hàng</h1>
      <form className="mt-5 grid gap-3 rounded-md bg-white p-3 sm:grid-cols-3 sm:p-4">
        <input name="q" placeholder="Tìm mã đơn, mã hàng, tên, số điện thoại, địa chỉ" defaultValue={q ?? ""} />
        <select name="status" defaultValue={status ?? ""}>
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">PENDING</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="SHIPPING">SHIPPING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <button className="rounded-md bg-slate-900 px-4 py-3 font-bold text-white sm:py-2">Lọc</button>
      </form>
      <div className="mt-5">
        <OrderTable orders={ordersWithEmail} />
      </div>
    </>
  );
}
