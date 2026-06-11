import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { CartIconButton } from "@/components/public/CartIconButton";

type HeaderProps = {
  store: {
    storeName: string;
    slogan?: string | null;
    phone: string;
    logoUrl?: string | null;
    zaloUrl?: string | null;
  };
};

export function Header({ store }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 md:flex-nowrap">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {store.logoUrl ? (
            <Image src={store.logoUrl} alt={store.storeName} width={52} height={52} className="h-10 w-10 shrink-0 rounded-md object-cover sm:h-12 sm:w-12" />
          ) : (
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-700 font-bold text-white sm:h-12 sm:w-12">BB</div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-900 sm:text-base">{store.storeName}</p>
            <p className="truncate text-xs text-brand-700 sm:text-sm">{store.slogan ?? "Bắp Bigsize"}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-900 md:flex">
          <Link href="/san-pham">Sản phẩm</Link>
          <Link href="/#bang-size">Bảng size</Link>
          <Link href="/tra-cuu-don">Tra cứu đơn</Link>
          <Link href="/#lien-he">Liên hệ</Link>
        </nav>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <CartIconButton />
          <a href={`tel:${store.phone}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white sm:flex-none">
            <Phone size={16} />
            <span>{store.phone}</span>
          </a>
          <a href={store.zaloUrl || `https://zalo.me/${store.phone}`} className="flex-1 rounded-md border border-brand-200 px-3 py-2 text-center text-sm font-semibold text-brand-700 sm:flex-none">
            Zalo
          </a>
        </div>
      </div>
    </header>
  );
}
