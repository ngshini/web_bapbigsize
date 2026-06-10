import fs from "node:fs";
import path from "node:path";

export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
export const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];
export const MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS];

export type PictureFile = {
  fileName: string;
  sourcePath: string;
  publicUrl: string;
  storagePath: string;
  mediaType: "IMAGE" | "VIDEO";
  role: "LOGO" | "SIZE_GUIDE" | "PRODUCT";
};

export function getPictureDir() {
  return path.join(process.cwd(), "picture");
}

export function getPublicPictureDir() {
  return path.join(process.cwd(), "public", "picture");
}

export function isSupportedMedia(fileName: string) {
  return MEDIA_EXTENSIONS.includes(path.extname(fileName).toLowerCase());
}

export function getMediaType(fileName: string): "IMAGE" | "VIDEO" {
  return VIDEO_EXTENSIONS.includes(path.extname(fileName).toLowerCase()) ? "VIDEO" : "IMAGE";
}

export function classifyPicture(fileName: string): PictureFile["role"] {
  const normalized = fileName.toLowerCase();
  if (/(logo|shop|tong-kho)/.test(normalized)) return "LOGO";
  if (/(size|bang-size|size-guide)/.test(normalized)) return "SIZE_GUIDE";
  return "PRODUCT";
}

export function listPictureFiles(): PictureFile[] {
  const dir = getPictureDir();
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter(isSupportedMedia)
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => ({
      fileName,
      sourcePath: path.join(dir, fileName),
      publicUrl: `/picture/${encodeURIComponent(fileName)}`,
      storagePath: fileName,
      mediaType: getMediaType(fileName),
      role: classifyPicture(fileName)
    }));
}

export function getFallbackLogoUrl() {
  const files = listPictureFiles();
  return files.find((file) => file.role === "LOGO" && file.mediaType === "IMAGE")?.publicUrl ?? null;
}

export function getFallbackSizeGuideUrl() {
  const files = listPictureFiles();
  return files.find((file) => file.role === "SIZE_GUIDE" && file.mediaType === "IMAGE")?.publicUrl ?? null;
}
