"use client";

import { formatCurrency } from "@/lib/formatCurrency";

type DataPoint = {
  date: string;
  label: string;
  amount: number;
};

export function RevenueChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return <p className="mt-4 text-sm text-slate-400">Chưa có dữ liệu doanh thu</p>;
  }

  const max = Math.max(...data.map((d) => d.amount), 1);
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="mt-4">
      <p className="text-sm text-slate-500">
        Tổng 7 ngày: <span className="font-bold text-brand-700">{formatCurrency(total)}</span>
      </p>

      {/* Bar chart */}
      <div className="mt-4 flex items-end gap-2" style={{ height: 200 }}>
        {data.map((d) => {
          const h = max > 0 ? Math.max((d.amount / max) * 150, 4) : 4;
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              {/* Số tiền — luôn hiển thị */}
              <span className="whitespace-nowrap text-xs font-bold text-brand-700">
                {d.amount > 0 ? formatCurrency(d.amount) : "0"}
              </span>
              {/* Bar */}
              <div
                className="w-full max-w-10 rounded-t-md bg-brand-700 transition-all hover:bg-brand-900"
                style={{ height: h }}
              />
              {/* Label */}
              <span className="text-xs text-slate-500">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
