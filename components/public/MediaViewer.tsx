import Image from "next/image";

export function MediaViewer({ media, name }: { media: { mediaUrl: string; mediaType: string; altText?: string | null }; name: string }) {
  if (media.mediaType === "VIDEO") {
    return <video src={media.mediaUrl} controls playsInline className="h-full w-full rounded-md bg-black object-contain" />;
  }

  return <Image src={media.mediaUrl} alt={media.altText ?? name} fill sizes="(max-width: 768px) 100vw, 50vw" className="rounded-md object-cover" priority />;
}
