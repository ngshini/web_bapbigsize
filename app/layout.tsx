import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tổng kho đồ bộ miền Nam - Bắp Bigsize",
  description: "Đồ bộ nữ big size, thời trang nữ big size form 45-85kg.",
  icons: {
    icon: "/picture/logo.jpg",
    apple: "/picture/logo.jpg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
