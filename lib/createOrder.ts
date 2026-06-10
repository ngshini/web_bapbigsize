import { prisma } from "@/lib/prisma";
import { calculatePromotionPrice } from "@/lib/pricing";

type CartOrderInput = {
  items: {
    productId: string;
    size: string;
    color: string;
    quantity: number;
  }[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  note?: string;
};

function makeOrderCode() {
  return `DH${Date.now().toString(36).toUpperCase()}`;
}

export async function createCartOrder(input: CartOrderInput) {
  return prisma.$transaction(async (tx) => {
    const orderItems = [];
    let totalAmount = 0;

    for (const item of input.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.status !== "ACTIVE") throw new Error("Sản phẩm hết hàng hoặc không tồn tại");

      const variant = await tx.productVariant.findFirst({
        where: { productId: item.productId, size: item.size, color: item.color, isActive: true }
      });
      if (!variant || variant.stockQuantity < item.quantity) throw new Error("Biến thể đã hết hàng hoặc không đủ tồn kho");

      const subtotal = calculatePromotionPrice(item.quantity, product.salePrice);
      totalAmount += subtotal;
      orderItems.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: Math.round(subtotal / item.quantity),
        subtotal
      });
    }

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
        totalAmount,
        note: input.note,
        items: { create: orderItems }
      }
    });

    for (const item of orderItems) {
      if (item.variantId) {
        await tx.productVariant.update({ where: { id: item.variantId }, data: { stockQuantity: { decrement: item.quantity } } });
      }
    }

    return order;
  });
}
