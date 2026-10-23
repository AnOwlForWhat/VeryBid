import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "VeryBid - AI-Powered Verified Collectibles Auctions",
  description: "Secure, verified online auction platform for collectibles and rare items with AI appraisal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#ededec] text-black min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
