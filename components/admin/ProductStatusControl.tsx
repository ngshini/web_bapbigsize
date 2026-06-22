"use client";

import { useState } from "react";
import { EyeOff, Eye, PackageX } from "lucide-react";

type Status = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  ACTIVE: { label: "Đang bán", color: "text-green-700 bg-green-50 border-green-200" },
  INACTIVE: { label: "Đã ẩn", color: "text-slate-500 bg-slate-100 border-slate-200" },
  OUT_OF_STOCK: { label: "Hết hàng", color: "text-red-600 bg-red-50 border-red-200" },
};

export function ProductStatusControl({ productId, initialStatus }: { productId: string; initialStatus: Status }) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const config = STATUS_CONFIG[status];

  async function changeStatus(newStatus: Status) {
    if (newStatus === status) { setOpen(false); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) setStatus(newStatus);
    setLoading(false);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold transition ${config.color} ${loading ? "opacity-50" : "hover:opacity-80"}`}
      >
        {config.label}
        <svg className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={() => changeStatus("ACTIVE")}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-green-50 ${status === "ACTIVE" ? "font-bold text-green-700" : "text-slate-700"}`}
            >
              <Eye size={15} />
              Đang bán
            </button>
            <button
              type="button"
              onClick={() => changeStatus("INACTIVE")}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-slate-50 ${status === "INACTIVE" ? "font-bold text-slate-600" : "text-slate-700"}`}
            >
              <EyeOff size={15} />
              Ẩn sản phẩm
            </button>
            <button
              type="button"
              onClick={() => changeStatus("OUT_OF_STOCK")}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-red-50 ${status === "OUT_OF_STOCK" ? "font-bold text-red-600" : "text-slate-700"}`}
            >
              <PackageX size={15} />
              Hết hàng
            </button>
          </div>
        </>
      )}
    </div>
  );
}
