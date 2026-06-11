"use client";

import { MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";

type ZaloChatButtonProps = {
  phone: string;
  zaloUrl?: string | null;
};

export function ZaloChatButton({ phone, zaloUrl }: ZaloChatButtonProps) {
  const [open, setOpen] = useState(false);
  const zaloLink = zaloUrl || `https://zalo.me/${phone}`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {/* Popup menu */}
      {open && (
        <div className="mb-2 w-64 animate-[fadeIn_0.2s_ease] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="bg-gradient-to-r from-brand-700 to-brand-900 p-4 text-white">
            <p className="font-bold">Bắp Bigsize</p>
            <p className="mt-1 text-sm text-white/80">Tư vấn và đặt hàng nhanh</p>
          </div>
          <div className="divide-y divide-slate-100 p-2">
            <a
              href={zaloLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-brand-50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-500 text-white">
                <MessageCircle size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-900">Nhắn Zalo</p>
                <p className="text-xs text-slate-500">Trả lời trong 5 phút</p>
              </div>
            </a>
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-brand-50"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-green-500 text-white">
                <Phone size={20} />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-900">Gọi ngay</p>
                <p className="text-xs text-slate-500">{phone}</p>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`group grid h-14 w-14 place-items-center rounded-full shadow-lg transition-all hover:scale-110 ${
          open
            ? "bg-slate-700 text-white"
            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        }`}
        aria-label="Chat hỗ trợ"
      >
        {open ? (
          <X size={24} />
        ) : (
          <>
            <MessageCircle size={26} />
            {/* Pulse animation */}
            <span className="absolute h-14 w-14 animate-ping rounded-full bg-blue-400 opacity-20" />
          </>
        )}
      </button>
    </div>
  );
}
