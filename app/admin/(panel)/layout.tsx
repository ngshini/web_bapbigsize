import { ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";

// Layout dùng chung cho khu vực quản trị: sidebar giữ cố định khi chuyển trang,
// chỉ phần nội dung được thay → chuyển trang mượt, không reload cả khung.
export const preferredRegion = "syd1";
export const dynamic = "force-dynamic";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
