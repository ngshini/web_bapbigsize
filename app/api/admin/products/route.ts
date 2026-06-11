import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = await prisma.product.findMany({ include: { media: true, variants: true, promotions: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: products });
}

export async function POST(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  const data = parsed.data;

  // Tự động tạo SKU unique tuyệt đối nếu để trống
  const ts = Date.now();
  const variantsWithSku = data.variants.map((v, index) => {
    const sku = v.sku?.trim() || `${data.productCode}-${v.color}-${v.size}-${ts}${index}`.replace(/\s+/g, "").toUpperCase();
    return { ...v, sku };
  });

  const product = await prisma.product.create({
    data: {
      categoryId: data.categoryId,
      productCode: data.productCode,
      name: data.name,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description,
      material: data.material,
      originalPrice: data.originalPrice,
      salePrice: data.salePrice,
      status: data.status,
      isHot: data.isHot,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      media: { create: data.media },
      variants: { create: variantsWithSku },
      promotions: { create: data.promotions }
    }
  });
  return NextResponse.json(product, { status: 201 });
}
