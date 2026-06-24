"use client";

import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";

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

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: Media[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const isVideo = ["mp4", "mov", "webm"].includes(ext);

      if (isVideo) {
        // Video: lấy signed URL từ server rồi upload trực tiếp lên Supabase (bypass giới hạn 4.5MB của Vercel)
        try {
          const urlRes = await fetch("/api/admin/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileName: file.name }),
          });
          if (!urlRes.ok) { console.error("Get signed URL error:", await urlRes.text()); continue; }
          const { signedUrl, path, publicUrl, mediaType } = await urlRes.json();

          const uploadRes = await fetch(signedUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!uploadRes.ok) { console.error("Upload video error:", uploadRes.status); continue; }

          uploaded.push({
            mediaUrl: publicUrl,
            mediaType: mediaType,
            altText: file.name,
            isMain: false,
            sortOrder: 0,
            storagePath: path,
            originalFileName: file.name,
          });
        } catch (err) { console.error("Upload video error:", err); }
      } else {
        // Ảnh: upload qua API (nhẹ, thường dưới 4.5MB)
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        if (response.ok) uploaded.push(await response.json());
      }
    }
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
      <input className="w-full text-sm" type="file" multiple accept="image/*,video/*" onChange={upload} />
      {uploading ? <p className="text-sm text-brand-700">Đang upload...</p> : null}
      {hasPendingChanges ? <p className="rounded-md bg-gold/30 p-2 text-sm font-semibold text-brand-900">Ảnh đã upload xong. Bấm “Lưu sản phẩm” ở cuối form để cập nhật lên website.</p> : null}
      <div className="grid gap-2">
        {media.map((item, index) => (
          <div key={`${item.mediaUrl}-${index}`} className="flex flex-col gap-3 rounded-md border p-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-md bg-brand-50 text-xs font-bold text-brand-700">
                {item.mediaType === "IMAGE" ? (
                  <Image src={item.mediaUrl} alt={item.altText ?? item.originalFileName ?? "Ảnh sản phẩm"} fill sizes="64px" className="object-cover" />
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
