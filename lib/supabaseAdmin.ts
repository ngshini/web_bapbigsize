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

// Giới hạn dung lượng mỗi file: 50MB (đủ cho video sản phẩm)
export const PRODUCT_MEDIA_SIZE_LIMIT = 1024 * 1024 * 50;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"];

export async function ensureProductMediaBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) throw listError;

  const exists = buckets.some((bucket) => bucket.name === PRODUCT_MEDIA_BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(PRODUCT_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: PRODUCT_MEDIA_SIZE_LIMIT,
      allowedMimeTypes: ALLOWED_MIME
    });
    if (error) throw error;
  } else {
    // Nâng giới hạn cho bucket đã tạo trước đây (trước chỉ 10MB) lên 50MB
    await supabase.storage.updateBucket(PRODUCT_MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: PRODUCT_MEDIA_SIZE_LIMIT,
      allowedMimeTypes: ALLOWED_MIME
    });
  }

  return supabase;
}
