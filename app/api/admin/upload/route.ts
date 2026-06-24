import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { ensureProductMediaBucket, PRODUCT_MEDIA_BUCKET } from "@/lib/supabaseAdmin";
import { getMediaType, isSupportedMedia } from "@/lib/media";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (!getAdminFromRequest(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const form = await request.formData();
  const file = form.get("file");
  
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (!isSupportedMedia(file.name)) return NextResponse.json({ error: "Định dạng file không hỗ trợ" }, { status: 400 });

  const supabase = await ensureProductMediaBucket();
  const path = `${Date.now()}-${file.name}`;
  
  const { error } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
    
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);
  
  return NextResponse.json({
    mediaUrl: data.publicUrl,
    mediaType: getMediaType(file.name),
    altText: file.name,
    isMain: false,
    sortOrder: 0,
    storagePath: path,
    originalFileName: file.name
  });
}