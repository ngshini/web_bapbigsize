import crypto from "crypto";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function verifyVnpay(params: Record<string, string>) {
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const secureHash = params.vnp_SecureHash;
  if (!hashSecret || !secureHash) return false;
  const signedParams = { ...params };
  delete signedParams.vnp_SecureHash;
  delete signedParams.vnp_SecureHashType;
  const search = new URLSearchParams(
    Object.keys(signedParams)
      .sort()
      .reduce<Record<string, string>>((result, key) => {
        result[key] = signedParams[key];
        return result;
      }, {})
  );
  const checkHash = crypto.createHmac("sha512", hashSecret).update(search.toString()).digest("hex");
  return checkHash === secureHash;
}

export default async function VnpayReturnPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const normalized = Object.fromEntries(Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  const isValid = verifyVnpay(normalized);
  const isPaid = isValid && normalized.vnp_ResponseCode === "00";
  const orderCode = normalized.vnp_TxnRef;

  if (isPaid && orderCode) {
    await prisma.order.update({ where: { orderCode }, data: { status: "CONFIRMED", note: `[VNPAY paid ${normalized.vnp_TransactionNo ?? ""}]` } }).catch(() => null);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-brand-50 px-4">
      <div className="max-w-lg rounded-md bg-white p-6 text-center shadow-soft">
        <p className={isPaid ? "text-2xl font-bold text-green-700" : "text-2xl font-bold text-red-600"}>{isPaid ? "Thanh toán VNPAY thành công" : "Thanh toán VNPAY chưa thành công"}</p>
        <p className="mt-3 text-slate-600">Mã đơn: {orderCode ?? "Không xác định"}</p>
        {!isValid ? <p className="mt-2 text-sm text-red-600">Chữ ký thanh toán không hợp lệ.</p> : null}
        <Link href="/gio-hang" className="mt-5 inline-block rounded-md bg-brand-700 px-5 py-3 font-bold text-white">
          Quay lại giỏ hàng
        </Link>
      </div>
    </main>
  );
}
