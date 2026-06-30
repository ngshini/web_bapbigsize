"use client";

import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import { createSupabaseBrowserClient, PRODUCT_MEDIA_BUCKET } from "@/lib/supabaseBrowser";

const MAX_FILE_SIZE = 1024 * 1024 * 50; // 50MB

type Media = {
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  altText?: string | null;
  isMain: boolean;
  sortOrder: number;
  storagePath?: string | null;
  originalFileName?: string | null;
};

export function MediaUploader<T extends {
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  altText?: string | null;
  isMain: boolean;
  sortOrder: number;
  storagePath?: string | null;
  originalFileName?: string | null;
}>({
  media,
  setMedia,
  colors = []
}: {
  media: T[];
  setMedia: Dispatch<SetStateAction<T[]>>;
  colors?: string[];
}) {
  const [uploading, setUploading] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    const uploaded: Media[] = [];
    const errors: string[] = [];
    const supabase = createSupabaseBrowserClient();

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: vượt quá 50MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        continue;
      }
      try {
        // 1) Xin signed upload URL từ server (request nhỏ)
        const res = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errors.push(`${file.name}: ${data.error ?? "không lấy được link upload"}`);
          continue;
        }
        const info = await res.json();
        // 2) Upload file thẳng lên Supabase qua signed URL (không qua Vercel)
        const { error: uploadError } = await supabase.storage
          .from(PRODUCT_MEDIA_BUCKET)
          .uploadToSignedUrl(info.path, info.token, file, { contentType: file.type });
        if (uploadError) {
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }
        uploaded.push({
          mediaUrl: info.publicUrl,
          mediaType: info.mediaType,
          altText: file.name,
          isMain: false,
          sortOrder: 0,
          storagePath: info.path,
          originalFileName: file.name
        });
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "lỗi không xác định"}`);
      }
    }

    if (errors.length) setError(errors.join("; "));
    if (uploaded.length) {
      // Dùng functional update để tránh stale closure
      setMedia((prev) => [
        ...prev,
        ...uploaded.map((item, index) => ({
          ...item,
          isMain: !prev.length && index === 0,
          sortOrder: prev.length + index
        } as unknown as T))
      ]);
      setHasPendingChanges(true);
    }
    setUploading(false);
    // Reset input để có thể upload lại cùng file
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold">Ảnh / video sản phẩm</h3>
      <input className="w-full text-sm" type="file" multiple accept="image/*,video/*" onChange={upload} disabled={uploading} />
      <p className="text-xs text-slate-500">Hỗ trợ ảnh (jpg, png, webp) và video (mp4, mov, webm), tối đa 50MB mỗi file.</p>
      {uploading ? <p className="text-sm text-brand-700">Đang upload...</p> : null}
      {error ? <p className="rounded-md bg-red-50 p-2 text-sm font-medium text-red-700">{error}</p> : null}
      {hasPendingChanges ? <p className="rounded-md bg-gold/30 p-2 text-sm font-semibold text-brand-900">Ảnh đã upload xong. Bấm “Lưu sản phẩm” ở cuối form để cập nhật lên website.</p> : null}
      <div className="grid gap-2">
        {media.map((item, index) => (
          <div key={`${item.mediaUrl}-${index}`} className="flex flex-col gap-3 rounded-md border p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-brand-50 text-xs font-bold text-brand-700">
                {item.mediaType === "IMAGE" ? (
                  // Dùng <img> thường cho preview admin: hiện ngay, không phụ thuộc bộ tối ưu next/image
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.mediaUrl} alt={item.altText ?? item.originalFileName ?? "Ảnh sản phẩm"} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span>Video</span>
                )}
                {/* Badge màu đã gán */}
                {item.altText && (
                  <span className="absolute bottom-0 left-0 right-0 bg-brand-900/80 py-0.5 text-center text-[9px] font-bold text-white">
                    {item.altText}
                  </span>
                )}
              </div>
              <span className="break-all sm:truncate">{item.originalFileName ?? item.mediaUrl}</span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* Gán màu cho ảnh */}
              {colors.length > 0 && item.mediaType === "IMAGE" && (
                <select
                  className="min-h-9 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                  value={item.altText ?? ""}
                  onChange={(e) => {
                    setMedia(media.map((m, i) => i === index ? { ...m, altText: e.target.value || null } as T : m));
                    setHasPendingChanges(true);
                  }}
                  title="Gán màu cho ảnh này"
                >
                  <option value="">-- Chọn màu --</option>
                  {colors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="mainMedia"
                  checked={item.isMain}
                  onChange={() => {
                    setMedia(media.map((current, currentIndex) => ({ ...current, isMain: currentIndex === index } as T)));
                    setHasPendingChanges(true);
                  }}
                />
                Ảnh chính
              </label>
              <button
                type="button"
                className="rounded-md border px-2 py-1"
                onClick={() => {
                  setMedia(media.filter((_, current) => current !== index));
                  setHasPendingChanges(true);
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
