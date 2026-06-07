import { CartCheckoutPage } from "@/components/public/CartCheckoutPage";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getStoreSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const store = await getStoreSettings();

  return (
    <>
      <Header store={store} />
      <main className="bg-white">
        <CartCheckoutPage phone={store.phone} />
      </main>
      <Footer store={store} />
    </>
  );
}
