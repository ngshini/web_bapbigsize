import { createClient } from "@supabase/supabase-js";

export const PRODUCT_MEDIA_BUCKET = "product-media";

export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function ensureProductMediaBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (!buckets.some((bucket) => bucket.name === PRODUCT_MEDIA_BUCKET)) {
    const { error } = await supabase.storage.createBucket(PRODUCT_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: 1024 * 1024 * 10,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"]
    });
    if (error) throw error;
  }

  return supabase;
}
