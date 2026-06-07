import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createCartOrder } from "@/lib/createOrder";
import { cartOrderSchema } from "@/lib/validators";

function getSiteUrl(request: NextRequest) {
  return process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const parsed = cartOrderSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";
  if (!partnerCode || !accessKey || !secretKey) {
    return NextResponse.json({ error: "Chưa cấu hình MOMO_PARTNER_CODE, MOMO_ACCESS_KEY hoặc MOMO_SECRET_KEY trong .env.local" }, { status: 500 });
  }

  const order = await createCartOrder({ ...parsed.data, note: `[MoMo sandbox] ${parsed.data.note ?? ""}`.trim() });
  const siteUrl = getSiteUrl(request);
  const requestId = `${order.orderCode}-${Date.now()}`;
  const orderId = order.orderCode;
  const amount = String(order.totalAmount);
  const orderInfo = `Thanh toan don hang ${order.orderCode}`;
  const redirectUrl = `${siteUrl}/thanh-toan/momo`;
  const ipnUrl = `${siteUrl}/api/payments/momo/ipn`;
  const requestType = "captureWallet";
  const extraData = "";
  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerCode,
      accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      extraData,
      requestType,
      signature,
      lang: "vi"
    })
  });
  const data = await response.json();
  if (!response.ok || !data.payUrl) {
    return NextResponse.json({ error: data.message ?? "Không tạo được thanh toán MoMo sandbox" }, { status: 502 });
  }

  return NextResponse.json({ orderCode: order.orderCode, paymentUrl: data.payUrl });
}
