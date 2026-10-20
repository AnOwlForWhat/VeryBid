"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black tracking-wider text-amber-500 hover:opacity-90 transition">
            VERY<span className="text-slate-100">BID</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/auctions"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition"
            >
              Sàn Đấu Giá
            </Link>
            <Link
              href="/sell"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5"
            >
              <span>Đăng Bán & Thẩm Định</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold">
                AI
              </span>
            </Link>
            <Link
              href="/moderator"
              className="text-sm font-medium text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5"
            >
              <span>Ban Kiểm Duyệt</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                Admin
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-xs text-slate-400">Loading...</span>
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/sell"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow transition"
              >
                <span>+ Đăng Bán</span>
              </Link>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.fullName}</p>
                <p className="text-xs text-amber-400">
                  Wallet: ${user.balance?.toFixed(2) ?? "0.00"} • Rep: {user.reputationScore}
                </p>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/sell"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/30 rounded-lg transition"
              >
                Đăng Bán
              </Link>
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-200 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-1.5 text-sm font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-md hover:shadow-amber-500/20 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
