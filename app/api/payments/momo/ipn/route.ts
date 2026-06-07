import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const secretKey = process.env.MOMO_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Missing MOMO_SECRET_KEY" }, { status: 500 });
  }

  const rawSignature = `accessKey=${body.accessKey}&amount=${body.amount}&extraData=${body.extraData}&message=${body.message}&orderId=${body.orderId}&orderInfo=${body.orderInfo}&orderType=${body.orderType}&partnerCode=${body.partnerCode}&payType=${body.payType}&requestId=${body.requestId}&responseTime=${body.responseTime}&resultCode=${body.resultCode}&transId=${body.transId}`;
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
  if (signature !== body.signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (Number(body.resultCode) === 0) {
    await prisma.order.update({ where: { orderCode: body.orderId }, data: { status: "CONFIRMED", note: `[MoMo paid ${body.transId}]` } });
  }

  return NextResponse.json({ ok: true });
}
