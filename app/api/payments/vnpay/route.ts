import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createCartOrder } from "@/lib/createOrder";
import { cartOrderSchema } from "@/lib/validators";

function getSiteUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

function sortObject(input: Record<string, string>) {
  return Object.keys(input)
    .sort()
    .reduce<Record<string, string>>((result, key) => {
      result[key] = input[key];
      return result;
    }, {});
}

function formatVnpDate(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

export async function POST(request: NextRequest) {
  const parsed = cartOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const tmnCode = process.env.VNPAY_TMN_CODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const paymentUrl = process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  if (!tmnCode || !hashSecret) {
    return NextResponse.json({ error: "Chưa cấu hình VNPAY_TMN_CODE hoặc VNPAY_HASH_SECRET trong .env.local" }, { status: 500 });
  }

  const order = await createCartOrder({ ...parsed.data, note: `[VNPAY sandbox] ${parsed.data.note ?? ""}`.trim() });
  const siteUrl = getSiteUrl(request);
  const params = sortObject({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: String(order.totalAmount * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: order.orderCode,
    vnp_OrderInfo: `Thanh toan don hang ${order.orderCode}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: `${siteUrl}/thanh-toan/vnpay`,
    vnp_IpAddr: request.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1",
    vnp_CreateDate: formatVnpDate(new Date())
  });
  const search = new URLSearchParams(params);
  const secureHash = crypto.createHmac("sha512", hashSecret).update(search.toString()).digest("hex");
  search.append("vnp_SecureHash", secureHash);

  return NextResponse.json({ orderCode: order.orderCode, paymentUrl: `${paymentUrl}?${search.toString()}` });
}
