"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [uptimeSeconds, setUptimeSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (total: number) => {
    const hrs = Math.floor(total / 3600).toString().padStart(2, "0");
    const mins = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
    const secs = (total % 60).toString().padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <header className="border-b-[3px] border-black bg-white">
      {/* 1. Classic Retro Titlebar */}
      <div className="retro-titlebar text-sm sm:text-base">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <Link href="/" className="font-bold text-lg mr-2 hover:underline">
            VERYBID.EXE
          </Link>

          <Link href="/auctions" className="retro-btn py-0.5 px-2 text-sm bg-white">
            File: Sàn Đấu Giá
          </Link>
          <Link href="/sell" className="retro-btn py-0.5 px-2 text-sm bg-white">
            Tool: Đăng Bán (AI)
          </Link>
          <Link href="/moderator" className="retro-btn py-0.5 px-2 text-sm bg-white">
            Card: Ban Kiểm Duyệt
          </Link>
          <a
            href="https://github.com/AnOwlForWhat/VeryBid"
            target="_blank"
            rel="noopener noreferrer"
            className="retro-btn py-0.5 px-2 text-sm bg-white hidden md:inline-flex"
          >
            Help: Mã Nguồn
          </a>
        </div>

        {/* Right Titlebar Info */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="hidden sm:flex items-center gap-1 border border-black px-2 py-0.5 bg-white">
            <span className="status-dot status-dot-online"></span>
            <span>SYSTEM: ONLINE</span>
          </div>

          <div className="hidden md:block border border-black px-2 py-0.5 bg-white font-mono text-xs">
            UPTIME: {formatUptime(uptimeSeconds)}
          </div>
        </div>
      </div>

      {/* 2. Header Identity Box (Inspired by owl-root) */}
      <div className="p-3 sm:p-4 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="text-3xl sm:text-4xl select-none">✿</div>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-2xl sm:text-3xl font-bold tracking-tight hover:underline">
                VERYBID
              </Link>
              <span className="retro-badge text-xs bg-yellow-200 font-bold border-black">
                v2.4 AI-OS
              </span>
            </div>
            <div className="text-sm sm:text-base text-gray-700">
              &ldquo;Collectibles &amp; Rare Items Verified by Multimodal AI &amp; Soft-Close Protocol&rdquo;
            </div>
          </div>
        </div>

        {/* User Account / Session Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-gray-200">
          {isLoading ? (
            <span className="text-sm">Loading session...</span>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="text-right border border-black bg-gray-50 px-2 py-1 text-xs sm:text-sm">
                <div>
                  User: <strong>{user.fullName}</strong>
                </div>
                <div className="text-amber-800">
                  Wallet: <strong>${user.balance?.toFixed(2) ?? "0.00"}</strong> • Rep: {user.reputationScore}
                </div>
              </div>

              <Link href="/sell" className="retro-btn retro-btn-primary text-sm font-bold">
                + Đăng Bán
              </Link>

              <button onClick={logout} className="retro-btn retro-btn-danger text-sm font-bold">
                Thoát
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="retro-btn text-sm">
                Đăng Nhập
              </Link>
              <Link href="/auth/register" className="retro-btn retro-btn-primary text-sm font-bold">
                Đăng Ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
