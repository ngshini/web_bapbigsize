"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Order = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string | Date;
  items: Array<{
    id: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    product?: {
      productCode: string;
    } | null;
  }>;
};

const statuses = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

// Bọc 1 giá trị thành ô CSV an toàn (escape dấu ", phẩy, xuống dòng)
function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function OrderTable({ orders }: { orders: Order[] }) {
  const [items, setItems] = useState(orders);

  function exportCsv() {
    const headers = ["Mã đơn", "Sản phẩm", "Tên khách hàng", "Số điện thoại", "Email", "Địa chỉ", "Tổng tiền", "Trạng thái", "Ngày tạo"];
    const rows = items.map((order) => {
      const products = order.items
        .map((item) => `${item.product?.productCode ?? "Không rõ mã"} - ${item.productName} (${item.size}, ${item.color}, SL: ${item.quantity})`)
        .join(" | ");
      return [
        order.orderCode,
        products,
        order.customerName,
        order.customerPhone,
        order.customerEmail ?? "",
        order.customerAddress,
        order.totalAmount,
        order.status,
        new Date(order.createdAt).toLocaleString("vi-VN")
      ].map(csvCell).join(",");
    });
    // ﻿ (BOM) để Excel đọc đúng tiếng Việt UTF-8
    const csv = "﻿" + [headers.map(csvCell).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function updateStatus(id: string, status: string) {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (response.ok) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    }
  }

  return (
    <div>
    <div className="mb-3 flex items-center justify-between gap-3">
      <p className="text-sm text-slate-500">{items.length} đơn hàng</p>
      <button
        type="button"
        onClick={exportCsv}
        disabled={items.length === 0}
        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
      >
        <Download size={16} />
        Xuất CSV
      </button>
    </div>
    <div className="-mx-3 overflow-x-auto rounded-md border bg-white sm:mx-0">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3">Mã đơn</th>
            <th className="p-3">Sản phẩm</th>
            <th className="p-3">Khách hàng</th>
            <th className="p-3">SĐT</th>
            <th className="p-3">Địa chỉ</th>
            <th className="p-3">Tổng tiền</th>
            <th className="p-3">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {items.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-3 font-semibold">{order.orderCode}</td>
              <td className="max-w-md p-3">
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id}>
                      <span className="font-semibold">{item.product?.productCode ?? "Không rõ mã"}</span>
                      <span> - {item.productName}</span>
                      <span className="text-slate-600">
                        {" "}
                        ({item.size}, {item.color}, SL: {item.quantity})
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="p-3">{order.customerName}</td>
              <td className="p-3">{order.customerPhone}</td>
              <td className="max-w-xs whitespace-normal p-3">{order.customerAddress}</td>
              <td className="p-3">{formatCurrency(order.totalAmount)}</td>
              <td className="p-3">
                <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value)}>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
