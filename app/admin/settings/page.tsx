import { AdminLayout } from "@/components/admin/AdminLayout";
import { prisma } from "@/lib/prisma";
import { defaultStore, getStoreSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const store = await getStoreSettings();
  const existing = await prisma.storeSetting.findFirst().catch(() => null);
  return (
    <AdminLayout>
      <h1 className="mb-5 text-2xl font-bold">Cài đặt shop</h1>
      <form action="/api/admin/settings" method="post" className="grid max-w-2xl gap-3 rounded-md bg-white p-5 shadow-sm">
        <input type="hidden" name="_method" value="PUT" />
        <input name="id" type="hidden" value={existing?.id ?? ""} />
        <label className="grid gap-1 text-sm font-medium">
          Tên shop
          <input name="storeName" defaultValue={store.storeName} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Slogan
          <input name="slogan" defaultValue={store.slogan ?? defaultStore.slogan} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Số điện thoại
          <input name="phone" defaultValue={store.phone} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Email
          <input name="email" defaultValue={store.email} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Địa chỉ
          <input name="address" defaultValue={store.address} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Logo URL
          <input name="logoUrl" defaultValue={store.logoUrl ?? ""} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Facebook URL
          <input name="facebookUrl" defaultValue={store.facebookUrl ?? ""} />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Zalo URL
          <input name="zaloUrl" defaultValue={store.zaloUrl ?? ""} />
        </label>
        <button className="rounded-md bg-brand-700 px-4 py-3 font-bold text-white">Lưu cài đặt</button>
      </form>
    </AdminLayout>
  );
}
