"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không trùng khớp");
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu phải chứa ít nhất 8 ký tự");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName,
        email,
        phone: phone || undefined,
        password,
      });
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng ký tài khoản thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 flex flex-col justify-center items-center">
      <div className="retro-window w-full max-w-md">
        {/* Titlebar */}
        <div className="retro-titlebar">
          <div className="flex items-center gap-2">
            <span className="font-black text-black">VERYBID_REGISTER.EXE</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="retro-btn py-0 px-2 text-xs">_</button>
            <button className="retro-btn py-0 px-2 text-xs">□</button>
            <Link href="/" className="retro-btn py-0 px-2 text-xs font-bold">✕</Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white space-y-5">
          <div className="text-center space-y-1 border-b-2 border-black pb-4">
            <Link href="/" className="inline-block text-3xl font-black tracking-wider text-black">
              ✿ VERYBID ✿
            </Link>
            <h2 className="text-lg font-bold text-black uppercase">
              ĐĂNG KÝ THÀNH VIÊN MỚI
            </h2>
            <p className="text-xs text-neutral-600">
              Gia nhập cộng đồng đấu giá & thẩm định số 1
            </p>
          </div>

          {error && (
            <div className="retro-box p-3 bg-[#fef2f2] text-xs font-bold text-black">
              ⚠ LỖI: {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Họ và Tên:
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="retro-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Địa chỉ Email:
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@example.com"
                className="retro-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Số Điện Thoại (Tùy chọn):
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="retro-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Mật khẩu (Tối thiểu 8 ký tự):
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="retro-input w-full"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Xác nhận Mật khẩu:
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="retro-input w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="retro-btn bg-[#fef08a] w-full py-2.5 font-black uppercase text-sm mt-3 disabled:opacity-50"
            >
              {loading ? "[ĐANG TẠO TÀI KHOẢN...]" : "▶ HOÀN TẤT ĐĂNG KÝ"}
            </button>
          </form>

          <div className="pt-2 border-t-2 border-black flex flex-col items-center gap-2 text-xs">
            <p className="text-neutral-600">
              Đã có tài khoản?{" "}
              <Link href="/auth/login" className="font-bold underline text-black">
                [ĐĂNG NHẬP]
              </Link>
            </p>
            <Link href="/" className="text-neutral-500 hover:text-black">
              ← Quay lại Sàn Đấu Giá
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
