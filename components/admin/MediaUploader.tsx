"use client";

import { ChangeEvent, useState } from "react";
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

export function MediaUploader({ media, setMedia }: { media: Media[]; setMedia: (media: Media[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: Media[] = [];
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      if (response.ok) uploaded.push(await response.json());
    }
    if (uploaded.length) {
      setMedia([...media, ...uploaded.map((item, index) => ({ ...item, isMain: !media.length && index === 0, sortOrder: media.length + index }))]);
      setHasPendingChanges(true);
    }
    setUploading(false);
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
              </div>
              <span className="break-all sm:truncate">{item.originalFileName ?? item.mediaUrl}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="mainMedia"
                  checked={item.isMain}
                  onChange={() => {
                    setMedia(media.map((current, currentIndex) => ({ ...current, isMain: currentIndex === index })));
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
