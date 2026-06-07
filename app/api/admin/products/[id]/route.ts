import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators";

function omitId<T extends { id?: string }>(item: T) {
  const copy = { ...item };
  delete copy.id;
  return copy;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { media: true, variants: true, promotions: true } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: product });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid data" }, { status: 400 });
  const data = parsed.data;
  const product = await prisma.$transaction(async (tx) => {
    await tx.productMedia.deleteMany({ where: { productId: id } });
    await tx.productVariant.deleteMany({ where: { productId: id } });
    await tx.promotion.deleteMany({ where: { productId: id } });
    return tx.product.update({
      where: { id },
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
        media: { create: data.media.map(omitId) },
        variants: { create: data.variants.map(omitId) },
        promotions: { create: data.promotions.map(omitId) }
      }
    });
  });
  return NextResponse.json(product);
}
