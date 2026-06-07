import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCreateProductPage() {
  const categories = await prisma.category.findMany({ where: { isActive: true } }).catch(() => []);
  return (
    <AdminLayout>
      <h1 className="mb-5 text-2xl font-bold">Thêm sản phẩm</h1>
      <ProductForm categories={categories} mode="create" />
    </AdminLayout>
  );
}
