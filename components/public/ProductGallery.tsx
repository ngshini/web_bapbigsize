"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { MediaViewer } from "@/components/public/MediaViewer";

type Media = {
  id: string;
  mediaUrl: string;
  mediaType: string;
  altText?: string | null;
  isMain?: boolean;
};

export function ProductGallery({ media, name }: { media: Media[]; name: string }) {
  const sorted = useMemo(() => media.filter(Boolean), [media]);
  const videos = useMemo(() => sorted.filter((item) => item.mediaType === "VIDEO"), [sorted]);
  const [active, setActive] = useState(() => sorted.find((item) => item.isMain && item.mediaType === "IMAGE") ?? sorted.find((item) => item.mediaType === "IMAGE") ?? sorted[0]);
  const activeIndex = Math.max(
    0,
    sorted.findIndex((item) => item.id === active?.id)
  );
  const canNavigate = sorted.length > 1;

  const showAt = useCallback((index: number) => {
    if (!sorted.length) return;
    const nextIndex = (index + sorted.length) % sorted.length;
    setActive(sorted[nextIndex]);
  }, [sorted]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") showAt(activeIndex - 1);
      if (event.key === "ArrowRight") showAt(activeIndex + 1);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, showAt]);

  if (!active) {
    return <div className="grid aspect-[4/5] place-items-center rounded-md bg-brand-50 text-brand-700">Chưa có media</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[88px_1fr]">
        <div className="order-2 grid grid-cols-5 gap-2 md:order-1 md:max-h-[760px] md:grid-cols-1 md:overflow-y-auto md:pr-1">
          {sorted.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActive(item)}
              className={`relative aspect-square overflow-hidden rounded-md border bg-white transition ${active.id === item.id ? "border-brand-700 ring-2 ring-brand-100" : "border-brand-100 hover:border-brand-300"}`}
            >
              {item.mediaType === "VIDEO" ? (
                <span className="grid h-full place-items-center bg-brand-900 text-white">
                  <span className="flex flex-col items-center gap-1 text-xs font-bold">
                    <Play size={22} />
                    Video
                  </span>
                </span>
              ) : (
                <Image src={item.mediaUrl} alt={item.altText ?? name} fill sizes="100px" className="object-cover" />
              )}
            </button>
          ))}
        </div>

        <div className="order-1 md:order-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-brand-50 shadow-soft sm:aspect-[4/5]">
            <MediaViewer media={active} name={name} />
            {canNavigate ? (
              <>
                <button
                  type="button"
                  aria-label="Ảnh trước"
                  onClick={() => showAt(activeIndex - 1)}
                  className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-900 shadow-md transition hover:bg-white"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  aria-label="Ảnh sau"
                  onClick={() => showAt(activeIndex + 1)}
                  className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-900 shadow-md transition hover:bg-white"
                >
                  <ChevronRight size={26} />
                </button>
                <div className="absolute bottom-3 right-3 rounded-full bg-brand-900/80 px-3 py-1 text-xs font-bold text-white">
                  {activeIndex + 1}/{sorted.length}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {videos.length ? (
        <div className="space-y-3 rounded-md border border-brand-100 bg-white p-3 shadow-soft">
          <p className="font-bold text-brand-900">Video sản phẩm</p>
          <div className="grid gap-3">
            {videos.map((item) => (
              <video key={`direct-${item.id}`} src={item.mediaUrl} controls playsInline preload="metadata" className="aspect-video w-full max-h-[70vh] rounded-md bg-black object-contain" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
