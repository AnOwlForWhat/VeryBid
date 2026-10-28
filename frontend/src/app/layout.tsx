import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "VeryBid - Sàn Đấu Giá Vật Phẩm Hiếm & Sưu Tầm Thẩm Định AI",
  description: "Sàn đấu giá vật phẩm sưu tầm uy tín với công nghệ thẩm định ảnh 5 góc AI Gemini Vision và cơ chế chống giật phút cuối Soft-Close.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-[#FAF9F5] text-[#1F1E1D] min-h-screen selection:bg-[#D97757]/20 selection:text-[#1F1E1D]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
