import { createClient } from "@supabase/supabase-js";

export const PRODUCT_MEDIA_BUCKET = "product-media";

// Client Supabase dùng ở trình duyệt (anon key) để upload file thẳng lên Storage
// qua signed upload URL — không đi qua server Vercel.
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
