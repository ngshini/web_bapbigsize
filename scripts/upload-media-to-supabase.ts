import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { ensureProductMediaBucket, PRODUCT_MEDIA_BUCKET } from "../lib/supabaseAdmin";
import { listPictureFiles } from "../lib/media";

loadEnvConfig(process.cwd());

function getContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".mov") return "video/quicktime";
  if (ext === ".webm") return "video/webm";
  return "application/octet-stream";
}

async function main() {
  const supabase = await ensureProductMediaBucket();
  const files = listPictureFiles();

  for (const file of files) {
    const bytes = fs.readFileSync(file.sourcePath);
    const { error } = await supabase.storage.from(PRODUCT_MEDIA_BUCKET).upload(file.storagePath, bytes, {
      upsert: true,
      contentType: getContentType(file.fileName)
    });
    if (error) throw error;
    const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(file.storagePath);
    console.log(`${file.fileName} -> ${data.publicUrl}`);
  }

  console.log(`Uploaded ${files.length} files to ${PRODUCT_MEDIA_BUCKET}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
