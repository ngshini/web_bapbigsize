import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { ensureProductMediaBucket, PRODUCT_MEDIA_BUCKET } from "@/lib/supabaseAdmin";
import { isSupportedMedia, getMediaType } from "@/lib/media";

export async function POST(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const fileName = body.fileName as string;
  if (!fileName || !isSupportedMedia(fileName)) {
    return NextResponse.json({ error: "Định dạng file không hỗ trợ" }, { status: 400 });
  }

  const supabase = await ensureProductMediaBucket();
  const path = `${Date.now()}-${fileName}`;
  const { data, error } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .createSignedUploadUrl(path);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: publicUrlData } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl: publicUrlData.publicUrl,
    mediaType: getMediaType(fileName),
  });
}
