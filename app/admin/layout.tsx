import { ReactNode } from "react";

// Đặt function admin gần Supabase DB (Sydney) để giảm độ trễ mỗi truy vấn.
// Segment config khai báo ở layout sẽ áp dụng cho mọi trang con trong /admin.
export const preferredRegion = "syd1";
export const dynamic = "force-dynamic";

export default function AdminSegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
