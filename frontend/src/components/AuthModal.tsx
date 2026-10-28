"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  title = "Đăng Nhập Để Tiếp Tục",
  description = "Bạn được tự do duyệt xem mọi phòng đấu giá. Để đặt giá hoặc đăng bán vật phẩm, vui lòng đăng nhập.",
  onSuccess,
}: AuthModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.");
      }
    }
  };

  const handleQuickLogin = async (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login({ email: presetEmail, password: "password123" });
      setIsLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Lỗi đăng nhập nhanh.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1E1D]/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-[#E5E4DE] rounded-2xl p-6 sm:p-7 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B6A66] hover:text-[#1F1E1D] p-1.5 rounded-lg hover:bg-[#F0EFEA] transition-colors"
          aria-label="Đóng"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="mb-5 text-center">
          <div className="inline-flex w-10 h-10 rounded-xl bg-[#FBF3F0] text-[#D97757] items-center justify-center font-bold text-lg mb-3 border border-[#F5D3C8]">
            ✦
          </div>
          <h3 className="text-xl font-bold text-[#1F1E1D]">{title}</h3>
          <p className="mt-1 text-xs sm:text-sm text-[#6B6A66] leading-relaxed">
            {description}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-xs text-[#991B1B] font-medium">
            ⚠ {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ten@vidu.com"
              className="claude-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F1E1D] mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="claude-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full claude-btn claude-btn-primary py-2.5 font-semibold text-sm disabled:opacity-50"
          >
            {isLoading ? "Đang xác thực..." : "Đăng Nhập"}
          </button>
        </form>

        {/* Quick Demo Login Picker */}
        <div className="mt-5 pt-4 border-t border-[#E5E4DE]">
          <span className="block text-[11px] font-semibold text-[#6B6A66] mb-2 uppercase tracking-wider text-center">
            ⚡ Đăng nhập thử nghiệm 1-click
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("bidder@verybid.com")}
              className="py-1.5 px-2 rounded-lg border border-[#E5E4DE] text-[11px] font-medium text-[#1F1E1D] hover:bg-[#F5F5F0] hover:border-[#D5D3CC] transition-colors"
            >
              🙋 Người Đấu
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("seller@verybid.com")}
              className="py-1.5 px-2 rounded-lg border border-[#E5E4DE] text-[11px] font-medium text-[#1F1E1D] hover:bg-[#F5F5F0] hover:border-[#D5D3CC] transition-colors"
            >
              💼 Người Bán
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@verybid.com")}
              className="py-1.5 px-2 rounded-lg border border-[#E5E4DE] text-[11px] font-medium text-[#1F1E1D] hover:bg-[#F5F5F0] hover:border-[#D5D3CC] transition-colors"
            >
              ⚖️ Quản Trị
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-5 text-center text-xs text-[#6B6A66]">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/register"
            onClick={onClose}
            className="font-semibold text-[#D97757] hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
