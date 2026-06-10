import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
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
  return crypto.createHmac("sha512", hashSecret).update(search.toString()).digest("hex") === secureHash;
}

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const orderCode = params.vnp_TxnRef;
  const amount = Number(params.vnp_Amount ?? 0) / 100;

  if (!verifyVnpay(params)) {
    return NextResponse.json({ RspCode: "97", Message: "Invalid signature" });
  }
  if (!orderCode) {
    return NextResponse.json({ RspCode: "01", Message: "Order not found" });
  }

  const order = await prisma.order.findUnique({ where: { orderCode } });
  if (!order) {
    return NextResponse.json({ RspCode: "01", Message: "Order not found" });
  }
  if (order.totalAmount !== amount) {
    return NextResponse.json({ RspCode: "04", Message: "Invalid amount" });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ RspCode: "02", Message: "Order already confirmed" });
  }

  if (params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00") {
    await prisma.order.update({
      where: { orderCode },
      data: { status: "CONFIRMED", note: `[VNPAY paid ${params.vnp_TransactionNo ?? ""}]` }
    });
    return NextResponse.json({ RspCode: "00", Message: "Confirm Success" });
  }

  return NextResponse.json({ RspCode: "00", Message: "Payment not success" });
}
