import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MomoReturnPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const orderCode = params.orderId;
  const isPaid = params.resultCode === "0";

  if (isPaid && orderCode) {
    await prisma.order.update({ where: { orderCode }, data: { status: "CONFIRMED", note: `[MoMo paid ${params.transId ?? ""}]` } }).catch(() => null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 px-4">
      <div className="max-w-lg rounded-md bg-white p-6 text-center shadow-soft">
        <p className={isPaid ? "text-2xl font-bold text-green-700" : "text-2xl font-bold text-red-600"}>{isPaid ? "Thanh toán MoMo thành công" : "Thanh toán MoMo chưa thành công"}</p>
        <p className="mt-3 text-slate-600">Mã đơn: {orderCode ?? "Không xác định"}</p>
        <Link href="/gio-hang" className="mt-5 inline-block rounded-md bg-brand-700 px-5 py-3 font-bold text-white">
          Quay lại giỏ hàng
        </Link>
      </div>
    </main>
  );
}
