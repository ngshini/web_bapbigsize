import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCartOrder } from "@/lib/createOrder";
import { calculatePromotionPrice } from "@/lib/pricing";
import { cartOrderSchema, orderSchema } from "@/lib/validators";

function makeOrderCode() {
  return `DH${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cartParsed = cartOrderSchema.safeParse(body);
  if (cartParsed.success) {
    const result = await createCartOrder(cartParsed.data);
    return NextResponse.json({ orderCode: result.orderCode, id: result.id });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const input = parsed.data;
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    if (!product || product.status !== "ACTIVE") throw new Error("Sản phẩm hết hàng hoặc không tồn tại");

    const variant = await tx.productVariant.findFirst({
      where: { productId: input.productId, size: input.size, color: input.color, isActive: true }
    });
    if (!variant || variant.stockQuantity < input.quantity) throw new Error("Biến thể đã hết hàng hoặc không đủ tồn kho");

    const total = calculatePromotionPrice(input.quantity, product.salePrice);
    const customer = await tx.customer.upsert({
      where: { phone: input.customerPhone },
      update: { fullName: input.customerName, address: input.customerAddress },
      create: { fullName: input.customerName, phone: input.customerPhone, address: input.customerAddress }
    });
    const order = await tx.order.create({
      data: {
        orderCode: makeOrderCode(),
        customerId: customer.id,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        totalAmount: total,
        note: input.note,
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            productName: product.name,
            size: input.size,
            color: input.color,
            quantity: input.quantity,
            unitPrice: Math.round(total / input.quantity),
            subtotal: total
          }
        }
      }
    });
    await tx.productVariant.update({ where: { id: variant.id }, data: { stockQuantity: { decrement: input.quantity } } });
    return order;
  });

  return NextResponse.json({ orderCode: result.orderCode, id: result.id });
}
