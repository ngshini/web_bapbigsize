import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, PhoneCall } from "lucide-react";
import { ZaloChatButton } from "@/components/public/ZaloChatButton";

type FooterProps = {
  store: {
    storeName: string;
    slogan?: string | null;
    phone: string;
    email: string;
    address: string;
    logoUrl?: string | null;
    facebookUrl?: string | null;
    zaloUrl?: string | null;
  };
};

export function Footer({ store }: FooterProps) {
  return (
    <footer className="relative overflow-hidden border-t border-brand-100 bg-gradient-to-br from-[#fff1f6] via-[#ffe4ee] to-[#ffd6e7] pb-16 text-brand-900 sm:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1.25fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            {store.logoUrl ? (
              <Image src={store.logoUrl} alt={store.storeName} width={76} height={76} className="h-16 w-16 rounded-md bg-white object-cover p-1" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-md bg-white font-bold text-brand-700">BB</div>
            )}
            <div>
              <p className="text-2xl font-bold leading-tight">{store.storeName}</p>
              <p className="mt-1 text-sm text-brand-700">{store.slogan ?? "Bắp Bigsize"}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm text-brand-900/80">
            <a href={`tel:${store.phone}`} className="flex items-center gap-2">
              <PhoneCall size={16} />
              Tổng đài CSKH: {store.phone}
            </a>
            <p className="flex items-center gap-2">
              <Mail size={16} />
              Email: {store.email}
            </p>
          </div>

          <div className="mt-7">
            <p className="font-bold uppercase">Đăng ký nhận tin</p>
            <p className="mt-3 text-sm text-brand-900/70">Hãy là người đầu tiên nhận khuyến mãi lớn!</p>
            <div className="mt-4 flex overflow-hidden border-b border-brand-300">
              <input className="min-h-11 flex-1 border-0 bg-transparent px-0 text-brand-900 placeholder:text-brand-900/40 focus:ring-0" placeholder="Nhập địa chỉ email" />
              <button className="mb-1 rounded-md bg-black px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-white">Đăng ký</button>
            </div>
          </div>

          <div className="mt-7">
            <p className="font-bold uppercase">Kết nối với chúng tôi</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["Zalo", store.zaloUrl || `https://zalo.me/${store.phone}`],
                ["IG", "#"],
                ["▶", "#"],
                ["♪", "#"]
              ].map(([label, href]) => (
                <a key={label} href={href} className="grid h-9 min-w-9 place-items-center rounded-md border border-brand-200 bg-white/70 px-2 text-sm font-bold text-brand-700 transition hover:bg-brand-700 hover:text-white">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="font-bold uppercase tracking-wide">Hỗ trợ khách hàng</p>
          <div className="mt-5 grid gap-4 text-sm text-brand-900/75">
            <Link href="/tra-cuu-don">Tra cứu đơn hàng</Link>
            <Link href="/#lien-he">Chính sách đổi hàng và bảo hành</Link>
            <Link href="/san-pham">Chính sách Membership</Link>
            <Link href="/san-pham">Chính sách ưu đãi sinh nhật</Link>
            <Link href="/#lien-he">Chính sách bảo mật</Link>
            <Link href="/gio-hang">Chính sách giao hàng</Link>
          </div>
        </div>

        <div>
          <p className="font-bold uppercase tracking-wide">Hệ thống cửa hàng</p>
          <div className="mt-4 space-y-5 text-sm text-brand-900/75">
            <div>
              <p className="flex items-center gap-2 text-base font-bold uppercase text-brand-900">
                <MapPin size={22} />
                Hồ Chí Minh
              </p>
              <p className="mt-1 leading-6">{store.address}</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-base font-bold uppercase text-brand-900">
                <MapPin size={22} />
                Giao hàng toàn quốc
              </p>
              <p className="mt-1 leading-6">Shop xác nhận size, màu và địa chỉ trước khi gửi hàng.</p>
            </div>
            <Link href="/#lien-he" className="inline-block border-b border-brand-700 pb-1 font-bold uppercase text-brand-700">
              Xem tất cả cửa hàng
            </Link>
          </div>
        </div>

        <div>
          <p className="font-bold uppercase tracking-wide">Phương thức thanh toán</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["MoMo", "VNPAY", "COD"].map((method) => (
              <span key={method} className="rounded-md border border-brand-200 bg-white/70 px-3 py-2 text-sm font-bold uppercase text-brand-700">
                {method}
              </span>
            ))}
          </div>


        </div>
      </div>

      <div className="border-t border-brand-100">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-brand-900/60">© Bản quyền thuộc về {store.storeName}</div>
      </div>

      <ZaloChatButton phone={store.phone} zaloUrl={store.zaloUrl} />
    </footer>
  );
}
