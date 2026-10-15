"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

import { Navbar } from "@/components/Navbar";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Header / Navbar */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-medium mb-8">
          ✨ Multimodal AI Appraisal & Real-Time Anti-Sniping Engine
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl">
          Collectibles & Rare Items,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Verified by AI.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed">
          The trusted marketplace for diecast models, vintage tech, and rare collectibles.
          Every listing is authenticated with Gemini AI vision reports and protected with soft-close auction rules.
        </p>

        {isAuthenticated && user && (
          <div className="mt-8 p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full text-left">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">
              Your Collector Profile
            </h3>
            <p className="text-xl font-bold text-white">{user.fullName}</p>
            <p className="text-sm text-slate-400 mb-4">{user.email}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-center">
              <div className="bg-slate-950 p-3 rounded-lg">
                <span className="text-xs text-slate-500 block">Available Balance</span>
                <span className="text-lg font-bold text-emerald-400">
                  ${user.balance?.toFixed(2) ?? "0.00"}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg">
                <span className="text-xs text-slate-500 block">Reputation</span>
                <span className="text-lg font-bold text-amber-400">
                  {user.reputationScore} / 100
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auctions"
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xl hover:shadow-amber-500/25 transition duration-200"
          >
            Explore Auctions
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold rounded-xl transition duration-200"
          >
            How AI Verification Works
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        &copy; 2026 VeryBid Platform. Built with Spring Boot 4 & Next.js 14.
      </footer>
    </div>
  );
}
