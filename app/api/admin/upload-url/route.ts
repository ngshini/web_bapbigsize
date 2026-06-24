import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { ensureProductMediaBucket, PRODUCT_MEDIA_BUCKET } from "@/lib/supabaseAdmin";
import { getMediaType, isSupportedMedia } from "@/lib/media";

export const preferredRegion = "syd1";

// Tạo signed upload URL để trình duyệt upload file thẳng lên Supabase,
// tránh giới hạn body 4.5MB của Vercel khi đi qua route handler.
export async function POST(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let fileName: unknown;
  try {
    ({ fileName } = await request.json());
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  }
  if (typeof fileName !== "string" || !isSupportedMedia(fileName)) {
    return NextResponse.json({ error: "Định dạng file không hỗ trợ" }, { status: 400 });
  }

  const supabase = await ensureProductMediaBucket();
  const path = `${Date.now()}-${fileName}`;
  const { data, error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);
  return NextResponse.json({
    path,
    token: data.token,
    publicUrl: pub.publicUrl,
    mediaType: getMediaType(fileName),
    originalFileName: fileName
  });
}
