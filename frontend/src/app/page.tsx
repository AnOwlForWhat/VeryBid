"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [selectedTip, setSelectedTip] = useState<string | null>(null);

  const tips = [
    "Tip 1: Các món đồ chụp đủ 5 góc (Mặt trước, Mặt sau, Tem Serial, Hộp, Vết xước) luôn đạt điểm Trust Score trên 95/100.",
    "Tip 2: Cơ chế Soft-Close: Nếu có người bid trong 2 phút cuối, phiên đấu giá sẽ tự động gia hạn thêm 2 phút để chống bot giật phút cuối.",
    "Tip 3: Bạn có thể dùng tùy chọn 'Mua Ngay' (Buy Now) để sở hữu ngay món đồ quý hiếm mà không cần chờ hết thời gian đấu giá.",
    "Tip 4: Mọi giao dịch đều được bảo vệ bằng Optimistic Locking chống xung đột mili-giây.",
  ];

  const handleShowTip = () => {
    const random = tips[Math.floor(Math.random() * tips.length)];
    setSelectedTip(random);
  };

  return (
    <div className="min-h-screen bg-[#ededec] flex flex-col justify-between p-2 sm:p-4">
      {/* Outer Main Window Frame */}
      <div className="retro-window max-w-6xl mx-auto w-full">
        {/* Navigation / Header */}
        <Navbar />

        {/* 3-Column Retro Layout (Modeled after owl-root) */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="retro-box p-4">
              <div className="font-bold border-b-2 border-black pb-1 mb-2 flex items-center justify-between">
                <span>VỀ VERYBID PLATFORM</span>
                <span>[01]</span>
              </div>
              <p className="text-base text-gray-800 leading-relaxed mb-3">
                Sàn đấu giá vật phẩm hiếm & đồ sưu tầm được thẩm định tự động bằng trí tuệ nhân tạo Multimodal Vision (Gemini 1.5).
              </p>

              <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                Các danh mục chuyên biệt đang hỗ trợ:
              </div>
              <div className="border-2 border-black p-1 bg-white">
                <select
                  size={6}
                  className="w-full bg-transparent border-0 outline-none font-mono text-base cursor-pointer"
                  defaultValue="diecast"
                >
                  <option value="diecast">🚗 Mô hình Diecast & Hot Wheels Redline</option>
                  <option value="vintage">💻 Thiết bị Retro Tech & Macintosh 1984</option>
                  <option value="sneakers">👟 Sneaker Hiếm & Giày Giới Hạn</option>
                  <option value="watches">⏱️ Đồng Hồ Cơ Cổ Điển & Chronograph</option>
                  <option value="art">🎴 Thẻ Bài Pokémon 1st Edition & Đồ Cổ</option>
                </select>
              </div>
            </div>

            {/* AI Trust Engine Specification Box */}
            <div className="retro-box p-4">
              <div className="font-bold border-b-2 border-black pb-1 mb-2 flex items-center justify-between">
                <span>QUY TRÌNH THẨM ĐỊNH AI</span>
                <span>[SCAN]</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between border-b border-gray-300 pb-1">
                  <span>Mô hình AI:</span>
                  <strong className="font-mono">Gemini 1.5 Flash Vision</strong>
                </div>
                <div className="flex items-center justify-between border-b border-gray-300 pb-1">
                  <span>Tiêu chuẩn góc ảnh:</span>
                  <strong>5 Góc Tiêu Chuẩn</strong>
                </div>
                <div className="flex items-center justify-between border-b border-gray-300 pb-1">
                  <span>Độ tin cậy trung bình:</span>
                  <span className="retro-badge bg-green-100 font-bold border-black">
                    96.8 / 100 TRUST
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chống giật bid (Soft-close):</span>
                  <strong>+2 Phút gia hạn</strong>
                </div>
              </div>
            </div>

            {/* Collector Profile Card if logged in */}
            {isAuthenticated && user && (
              <div className="retro-box p-4 bg-yellow-50">
                <div className="font-bold border-b-2 border-black pb-1 mb-2">
                  HỒ SƠ NHÀ SƯU TẦM
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    Tên: <strong>{user.fullName}</strong>
                  </div>
                  <div>
                    Email: <span className="font-mono text-xs">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                    <span>Số dư khả dụng:</span>
                    <strong className="text-emerald-700 text-lg">
                      ${user.balance?.toFixed(2) ?? "0.00"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Column (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Action Navigator Box */}
            <div className="retro-box p-4">
              <div className="font-bold border-b-2 border-black pb-1 mb-2">
                TRUY CẬP NHANH CÁC PHÒNG CHỨC NĂNG
              </div>
              <div className="space-y-2.5 pt-1">
                <Link
                  href="/auctions"
                  className="retro-btn retro-btn-primary w-full py-2 text-center text-lg font-bold block"
                >
                  🚀 Vào Sàn Đấu Giá Trực Tiếp (Live Auctions)
                </Link>
                <Link
                  href="/sell"
                  className="retro-btn w-full py-2 text-center text-lg font-bold block bg-white"
                >
                  📸 Đăng Bán & Thẩm Định 5 Góc Ảnh (Sell Studio)
                </Link>
                <Link
                  href="/moderator"
                  className="retro-btn w-full py-2 text-center text-lg font-bold block bg-gray-100"
                >
                  ⚖️ Ban Kiểm Duyệt & Đối Soát AI (Moderator Hub)
                </Link>
              </div>
            </div>

            {/* 4 Steps How it works Box */}
            <div className="retro-box p-4">
              <div className="font-bold border-b-2 border-black pb-1 mb-2">
                4 BƯỚC ĐẤU GIÁ AN TOÀN TẠI VERYBID
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="font-bold px-1.5 py-0.5 border border-black bg-white">01</span>
                  <div>
                    <strong>Chụp 5 góc chi tiết:</strong> Người bán tải ảnh Mặt trước, Mặt sau, Tem serial, Hộp, Vết xước.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold px-1.5 py-0.5 border border-black bg-white">02</span>
                  <div>
                    <strong>AI Vision quét đối soát:</strong> Tự động phân tích model, phát hiện tem mác và cấp Trust Score.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold px-1.5 py-0.5 border border-black bg-white">03</span>
                  <div>
                    <strong>Kiểm duyệt viên duyệt sàn:</strong> Chuyên gia thẩm định xác nhận hồ sơ và kích hoạt phiên đấu giá.
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="font-bold px-1.5 py-0.5 border border-black bg-white">04</span>
                  <div>
                    <strong>Đấu giá thời gian thực:</strong> Trả giá sub-second qua WebSocket, bảo vệ chống giật phút cuối.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (3 cols) */}
          <div className="md:col-span-3 space-y-4">
            {/* Live System Stats Box */}
            <div className="retro-box p-4 bg-gray-50">
              <div className="font-bold border-b-2 border-black pb-1 mb-2">
                THỐNG KÊ HỆ THỐNG
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 block text-xs">Phiên đang diễn ra:</span>
                  <strong className="text-xl font-bold">4 Đang Chạy</strong>
                </div>
                <div>
                  <span className="text-gray-600 block text-xs">Đang chờ kiểm duyệt:</span>
                  <strong className="text-xl font-bold text-amber-700">2 Hồ Sơ</strong>
                </div>
                <div>
                  <span className="text-gray-600 block text-xs">Độ chính xác xác thực:</span>
                  <strong className="text-xl font-bold text-emerald-700">99.4% Match</strong>
                </div>
                <div>
                  <span className="text-gray-600 block text-xs">Cơ chế tranh chấp:</span>
                  <strong>Optimistic Locking v2</strong>
                </div>
              </div>
            </div>

            {/* Test Accounts Box */}
            <div className="retro-box p-4">
              <div className="font-bold border-b-2 border-black pb-1 mb-2 text-xs">
                TÀI KHOẢN MẪU (PASS: password123)
              </div>
              <div className="text-xs space-y-1.5 font-mono">
                <div className="p-1 border border-black bg-white">
                  <strong>Admin:</strong> admin@verybid.com
                </div>
                <div className="p-1 border border-black bg-white">
                  <strong>Seller:</strong> seller@verybid.com
                </div>
                <div className="p-1 border border-black bg-white">
                  <strong>Bidder:</strong> bidder@verybid.com
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Retro Click-Me Interactive Box (Exact Owl-Root signature feature) */}
        <div className="p-4 pt-0">
          <div className="retro-click-box" onClick={handleShowTip}>
            <div className="text-3xl font-bold">:-)</div>
            <div className="text-lg font-bold hover:underline">
              [ BẤM VÀO ĐÂY ĐỂ NHẬN BÍ KÍP ĐẤU GIÁ AN TOÀN ]
            </div>
            {selectedTip && (
              <div className="mt-3 p-3 border-2 border-black bg-yellow-100 text-sm max-w-xl mx-auto font-mono">
                ★ {selectedTip}
              </div>
            )}
          </div>
        </div>

        {/* Bottom System Status Bar */}
        <div className="border-t-2 border-black bg-gray-100 p-2 text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            VeryBid OS v2.4 • Concurrency & Multi-Angle Verification Protocol
          </div>
          <div className="flex items-center gap-3">
            <span>Encoding: UTF-8</span>
            <span>Broker: STOMP/WebSocket</span>
            <span>Engine: Spring Boot 4</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-3">
        &copy; 2026 VeryBid Platform. Inspired by Retro OS & Brutalist Design.
      </footer>
    </div>
  );
}
