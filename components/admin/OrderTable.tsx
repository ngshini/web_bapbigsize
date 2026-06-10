"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatCurrency";

type Order = {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
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

export function OrderTable({ orders }: { orders: Order[] }) {
  const [items, setItems] = useState(orders);

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
  );
}
