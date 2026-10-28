"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "ROLE_ADMIN";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E4DE] bg-[#FAF9F5]/90 backdrop-blur-md transition-all">
      {/* Top micro info strip */}
      <div className="border-b border-[#E5E4DE]/60 bg-[#F5F5F0] px-4 py-1.5 text-xs text-[#6B6A66]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-online"></span>
            <span className="font-medium text-[#1F1E1D]">VERYBID ENGINE ONLINE</span>
            <span className="text-[#9E9D96] hidden sm:inline">•</span>
            <span className="hidden sm:inline">Thẩm định đa góc Multimodal AI (Gemini Vision)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[#6B6A66] hidden md:inline">Cơ chế Soft-Close (+2 Phút gia hạn)</span>
            <a
              href="https://github.com/AnOwlForWhat/VeryBid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B6A66] hover:text-[#1F1E1D] transition-colors"
            >
              Mã nguồn GitHub ↗
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#D97757] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                ✦
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-[#1F1E1D] group-hover:text-[#D97757] transition-colors leading-tight">
                  VERYBID
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#6B6A66] font-medium leading-none">
                  Verified Collectibles
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/auctions"
                className="px-3 py-1.5 rounded-md text-[#6B6A66] hover:text-[#1F1E1D] hover:bg-[#F0EFEA] transition-colors"
              >
                Sàn Đấu Giá
              </Link>

              {/* Show Sell button in nav if logged in */}
              {isAuthenticated && (
                <Link
                  href="/sell"
                  className="px-3 py-1.5 rounded-md text-[#6B6A66] hover:text-[#1F1E1D] hover:bg-[#F0EFEA] transition-colors"
                >
                  Đăng Bán (AI Studio)
                </Link>
              )}

              {/* Only show Moderator & Admin to ADMIN users */}
              {isAdmin && (
                <div className="flex items-center gap-1 pl-2 border-l border-[#E5E4DE]">
                  <Link
                    href="/moderator"
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FBF3F0] text-[#B35537] border border-[#F5D3C8] hover:bg-[#F5D3C8] transition-colors"
                  >
                    ⚖️ Ban Kiểm Duyệt
                  </Link>
                  <Link
                    href="/admin"
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#F0EFEA] text-[#1F1E1D] hover:bg-[#E5E4DE] transition-colors"
                  >
                    🛠️ Quản Trị
                  </Link>
                </div>
              )}
            </nav>
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoading ? (
              <div className="h-8 w-24 rounded-md bg-[#E5E4DE] animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User wallet balance */}
                <div className="px-3 py-1.5 rounded-lg bg-white border border-[#E5E4DE] text-xs flex items-center gap-3 shadow-sm">
                  <div>
                    <span className="text-[#6B6A66] block text-[10px] font-medium">Số dư khả dụng</span>
                    <strong className="text-[#15803D] font-mono text-sm">
                      ${user.balance?.toFixed(2) ?? "0.00"}
                    </strong>
                  </div>
                  <div className="border-l border-[#E5E4DE] pl-2.5 text-right">
                    <span className="text-[#6B6A66] block text-[10px] font-medium">Tín nhiệm</span>
                    <span className="text-[#D97757] font-bold text-xs">{user.reputationScore} Rep</span>
                  </div>
                </div>

                {/* Sell button */}
                <Link
                  href="/sell"
                  className="claude-btn claude-btn-primary py-1.5 px-3 text-xs"
                >
                  + Đăng Bán
                </Link>

                {/* User pill & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#E5E4DE]">
                  <div className="text-right hidden lg:block">
                    <div className="text-xs font-medium text-[#1F1E1D]">{user.fullName}</div>
                    <div className="text-[10px] text-[#6B6A66] font-mono truncate max-w-[120px]">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="px-2.5 py-1.5 rounded-md text-xs text-[#6B6A66] hover:text-[#991B1B] hover:bg-[#FEE2E2] transition-colors font-medium"
                    title="Đăng xuất"
                  >
                    Thoát
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#6B6A66] hover:text-[#1F1E1D] hover:bg-[#F0EFEA] transition-colors"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="claude-btn claude-btn-primary py-1.5 px-3.5 text-sm"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#6B6A66] hover:text-[#1F1E1D] hover:bg-[#F0EFEA]"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-[#E5E4DE] space-y-2">
            <Link
              href="/auctions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F1E1D] hover:bg-[#F0EFEA]"
            >
              🏛️ Sàn Đấu Giá
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/sell"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm font-medium text-[#D97757] hover:bg-[#FBF3F0]"
                >
                  📸 Đăng Bán Sản Phẩm
                </Link>

                {isAdmin && (
                  <>
                    <Link
                      href="/moderator"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-[#B35537] hover:bg-[#FBF3F0]"
                    >
                      ⚖️ Ban Kiểm Duyệt
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-sm font-medium text-[#1F1E1D] hover:bg-[#F0EFEA]"
                    >
                      🛠️ Trang Quản Trị
                    </Link>
                  </>
                )}

                <div className="pt-2 border-t border-[#E5E4DE] flex items-center justify-between px-3">
                  <div className="text-xs">
                    <span className="font-semibold block">{user?.fullName}</span>
                    <span className="text-[#15803D] font-mono">${user?.balance?.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-[#991B1B] font-medium px-2 py-1 bg-[#FEE2E2] rounded"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-[#E5E4DE] flex gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium rounded-lg border border-[#E5E4DE] bg-white text-[#1F1E1D]"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium rounded-lg bg-[#D97757] text-white"
                >
                  Đăng Ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
