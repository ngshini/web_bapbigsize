import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true } }),
    prisma.product.findUnique({ where: { id }, include: { media: true, variants: true, promotions: true } })
  ]);
  if (!product) notFound();
  return (
    <>
      <h1 className="mb-5 text-2xl font-bold">Sửa sản phẩm</h1>
      <ProductForm categories={categories} product={product} mode="edit" />
    </>
  );
}
