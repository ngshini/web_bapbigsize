import Link from "next/link";
import { ReactNode } from "react";

const nav = [
  ["Dashboard", "/admin/dashboard"],
  ["Sản phẩm", "/admin/products"],
  ["Đơn hàng", "/admin/orders"],
  ["Cài đặt", "/admin/settings"]
];

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white p-5 md:block">
        <p className="text-lg font-bold text-brand-900">Admin Bắp Bigsize</p>
        <nav className="mt-6 space-y-2">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              {label}
            </Link>
          ))}
        </nav>
        <form action="/api/admin/logout" method="post" className="mt-6">
          <button className="rounded-md border px-3 py-2 text-sm">Đăng xuất</button>
        </form>
      </aside>
      <header className="sticky top-0 z-40 border-b bg-white px-3 py-3 md:hidden">
        <p className="font-bold text-brand-900">Admin Bắp Bigsize</p>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 rounded-md bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700">
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="p-3 sm:p-4 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
