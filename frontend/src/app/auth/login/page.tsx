"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid email or password");
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
            <span className="font-black text-black">VERYBID_LOGIN.EXE</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="retro-btn py-0 px-2 text-xs">_</button>
            <button className="retro-btn py-0 px-2 text-xs">□</button>
            <Link href="/" className="retro-btn py-0 px-2 text-xs font-bold">✕</Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-white space-y-6">
          <div className="text-center space-y-1 border-b-2 border-black pb-4">
            <Link href="/" className="inline-block text-3xl font-black tracking-wider text-black">
              ✿ VERYBID ✿
            </Link>
            <h2 className="text-lg font-bold text-black uppercase">
              XÁC THỰC NGƯỜI DÙNG HỆ THỐNG
            </h2>
            <p className="text-xs text-neutral-600">
              Đăng nhập để tham gia đấu giá vật phẩm sưu tầm quý hiếm
            </p>
          </div>

          {error && (
            <div className="retro-box p-3 bg-[#fef2f2] text-xs font-bold text-black">
              ⚠ LỖI: {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Tài khoản Email:
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
                htmlFor="password"
                className="block text-xs font-bold text-black uppercase mb-1"
              >
                Mật mã đăng nhập:
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

            <button
              type="submit"
              disabled={loading}
              className="retro-btn bg-[#fef08a] w-full py-2.5 font-black uppercase text-sm mt-4 disabled:opacity-50"
            >
              {loading ? "[ĐANG XÁC THỰC...]" : "▶ ĐĂNG NHẬP HỆ THỐNG"}
            </button>
          </form>

          <div className="pt-2 border-t-2 border-black flex flex-col items-center gap-2 text-xs">
            <p className="text-neutral-600">
              Chưa có tài khoản đấu giá?{" "}
              <Link href="/auth/register" className="font-bold underline text-black">
                [ĐĂNG KÝ NGAY]
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
