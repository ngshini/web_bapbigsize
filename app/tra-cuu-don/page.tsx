import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { OrderLookupPage } from "@/components/public/OrderLookupPage";
import { getStoreSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tra cứu đơn hàng — Bắp Bigsize",
  description: "Nhập số điện thoại để xem tình trạng đơn hàng của bạn tại Bắp Bigsize"
};

export default async function TraCuuDonPage() {
  const store = await getStoreSettings();

  return (
    <>
      <Header store={store} />
      <main className="min-h-[60vh] bg-brand-50">
        <OrderLookupPage />
      </main>
      <Footer store={store} />
    </>
  );
}
