"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { auctionApi } from "@/services/auctionApi";
import { Auction, AuctionStatus, Category } from "@/types/auction";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Catalog state on Landing Page
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AuctionStatus | "ALL">("ACTIVE");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isLoadingAuctions, setIsLoadingAuctions] = useState<boolean>(true);

  // Auth modal state for protected actions
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalDescription, setAuthModalDescription] = useState<string>("");

  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await auctionApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories on landing page", err);
      }
    }
    fetchCategories();
  }, []);

  // Load live auctions preview
  const loadAuctions = useCallback(async () => {
    setIsLoadingAuctions(true);
    try {
      const data = await auctionApi.getAuctions({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        categoryId: selectedCategory ?? undefined,
        keyword: searchKeyword.trim() ? searchKeyword.trim() : undefined,
        page: 0,
        size: 6,
      });
      setAuctions(data.content);
    } catch (err) {
      console.error("Failed to load preview auctions", err);
    } finally {
      setIsLoadingAuctions(false);
    }
  }, [selectedStatus, selectedCategory, searchKeyword]);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  // Handle protected action trigger
  const handleProtectedAction = (actionType: "SELL" | "BID", targetAuctionId?: string) => {
    if (isAuthenticated) {
      if (actionType === "SELL") {
        router.push("/sell");
      } else if (targetAuctionId) {
        router.push(`/auctions/${targetAuctionId}`);
      }
    } else {
      if (actionType === "SELL") {
        setAuthModalDescription("Bạn cần đăng nhập tài khoản Người bán để nộp sản phẩm lên sàn thẩm định AI.");
      } else {
        setAuthModalDescription("Bạn cần đăng nhập tài khoản để tham gia đặt giá hoặc mua ngay món đồ này.");
      }
      setIsAuthModalOpen(true);
    }
  };

  const getStatusBadge = (status: AuctionStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="claude-badge claude-badge-success text-[11px]">
            <span className="status-dot status-dot-online"></span>
            ĐANG ĐẤU GIÁ
          </span>
        );
      case "UPCOMING":
        return (
          <span className="claude-badge claude-badge-warning text-[11px]">
            <span className="status-dot status-dot-busy"></span>
            SẮP MỞ
          </span>
        );
      case "ENDED":
        return (
          <span className="claude-badge claude-badge-subtle text-[11px]">
            ĐÃ KẾT THÚC
          </span>
        );
      default:
        return (
          <span className="claude-badge claude-badge-subtle text-[11px]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1F1E1D] flex flex-col justify-between">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 border-b border-[#E5E4DE] bg-gradient-to-b from-[#F5F5F0]/70 to-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBF3F0] border border-[#F5D3C8] text-[#D97757] text-xs font-semibold tracking-wide">
              <span>✦</span> SÀN ĐẤU GIÁ VẬT PHẨM SƯU TẦM THẨM ĐỊNH AI MULTIMODAL
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1F1E1D] leading-tight sm:leading-[1.15]">
              Sưu tầm & Đấu giá vật phẩm hiếm với sự bảo chứng của{" "}
              <span className="text-[#D97757]">AI Gemini Vision</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6B6A66] leading-relaxed max-w-2xl mx-auto">
              Tự do khám phá, tìm kiếm và xem trước các phiên đấu giá vật phẩm cổ điển, mô hình giới hạn, giày hiếm. Cơ chế chống giật phút cuối <strong className="text-[#1F1E1D]">Soft-Close</strong> bảo đảm tính công bằng tuyệt đối.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#live-catalog"
                className="claude-btn claude-btn-primary py-2.5 px-6 text-sm font-semibold shadow-sm"
              >
                🔍 Khám Phá Sàn Đấu Giá (Xem Trước)
              </a>
              <button
                type="button"
                onClick={() => handleProtectedAction("SELL")}
                className="claude-btn claude-btn-secondary py-2.5 px-6 text-sm font-semibold"
              >
                📸 Đăng Bán Thẩm Định 5 Góc
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
              <div className="p-3 bg-white rounded-xl border border-[#E5E4DE] shadow-sm">
                <span className="text-[11px] font-semibold text-[#6B6A66] block uppercase">Thẩm định AI</span>
                <span className="text-xl font-bold text-[#1F1E1D]">Gemini 1.5</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E5E4DE] shadow-sm">
                <span className="text-[11px] font-semibold text-[#6B6A66] block uppercase">Góc ảnh chuẩn</span>
                <span className="text-xl font-bold text-[#D97757]">5 Góc Tiêu Chuẩn</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E5E4DE] shadow-sm">
                <span className="text-[11px] font-semibold text-[#6B6A66] block uppercase">Chống bot giật bid</span>
                <span className="text-xl font-bold text-[#1F1E1D]">+2 Phút Gia Hạn</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E5E4DE] shadow-sm">
                <span className="text-[11px] font-semibold text-[#6B6A66] block uppercase">Độ tin cậy</span>
                <span className="text-xl font-bold text-[#15803D]">96.8% Trust</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Catalog Section (Browse, Search, Filter Without Signup) */}
      <section id="live-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97757] mb-1">
              <span>●</span> LIVE AUCTION SHOWCASE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F1E1D]">
              Các Phiên Đấu Giá Nổi Bật
            </h2>
            <p className="text-sm text-[#6B6A66] mt-1">
              Xem trước đầy đủ hình ảnh, hồ sơ thẩm định và lịch sử trả giá mà không cần tài khoản.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auctions"
              className="claude-btn claude-btn-secondary text-xs font-medium"
            >
              Xem Toàn Bộ Kho Đấu Giá →
            </Link>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:p-5 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm mb-8 space-y-4">
          {/* Keyword Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9D96]">
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm Hot Wheels, Apple Macintosh 1984, Nike Air Mag, Đồng hồ cổ..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="claude-input pl-9"
              />
            </div>
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="claude-btn claude-btn-secondary text-xs px-3"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>

          {/* Status Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E4DE]">
            <span className="text-xs font-semibold text-[#6B6A66] mr-1">Trạng thái:</span>
            {(["ALL", "ACTIVE", "UPCOMING", "ENDED"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-[#1F1E1D] text-white shadow-sm"
                    : "bg-[#F5F5F0] text-[#6B6A66] hover:bg-[#EAE8E1] hover:text-[#1F1E1D]"
                }`}
              >
                {status === "ALL"
                  ? "Tất cả"
                  : status === "ACTIVE"
                  ? "🔴 Đang diễn ra"
                  : status === "UPCOMING"
                  ? "⏳ Sắp diễn ra"
                  : "Đã chốt sổ"}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E4DE]">
            <span className="text-xs font-semibold text-[#6B6A66] mr-1">Danh mục:</span>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-[#D97757] text-white shadow-sm"
                  : "bg-[#F5F5F0] text-[#6B6A66] hover:bg-[#EAE8E1] hover:text-[#1F1E1D]"
              }`}
            >
              Tất cả danh mục
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#D97757] text-white shadow-sm"
                    : "bg-[#F5F5F0] text-[#6B6A66] hover:bg-[#EAE8E1] hover:text-[#1F1E1D]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live Auction Grid */}
        {isLoadingAuctions ? (
          <div className="py-20 text-center bg-white border border-[#E5E4DE] rounded-2xl">
            <div className="inline-block animate-spin text-2xl mb-2">⌛</div>
            <div className="text-sm font-semibold text-[#1F1E1D]">Đang cập nhật danh mục đấu giá trực tiếp...</div>
            <p className="text-xs text-[#6B6A66] mt-1">Đồng bộ tỷ giá và thời gian từ máy chủ VeryBid</p>
          </div>
        ) : auctions.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#E5E4DE] rounded-2xl p-6">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="text-base font-bold text-[#1F1E1D]">Không tìm thấy vật phẩm nào</h3>
            <p className="text-xs text-[#6B6A66] mt-1 max-w-sm mx-auto">
              Không có sản phẩm nào khớp với bộ lọc bạn đã chọn. Hãy thử xóa từ khóa tìm kiếm hoặc chọn danh mục khác.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedStatus("ALL");
                setSearchKeyword("");
              }}
              className="mt-4 claude-btn claude-btn-secondary text-xs"
            >
              Đặt Lại Bộ Lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => {
              const thumbnail =
                auction.item?.images?.find((img) => img.isThumbnail)?.imageUrl ||
                auction.item?.images?.[0]?.imageUrl ||
                "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80";

              return (
                <div
                  key={auction.id}
                  className="claude-card flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Thumbnail Box */}
                  <div>
                    <div className="relative aspect-[4/3] bg-[#F5F5F0] overflow-hidden border-b border-[#E5E4DE]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt={auction.item?.title ?? "Vật phẩm đấu giá"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5">
                        {getStatusBadge(auction.status)}
                      </div>

                      {auction.item?.category && (
                        <div className="absolute top-2.5 right-2.5">
                          <span className="claude-badge bg-white/90 backdrop-blur-sm text-[10px] text-[#1F1E1D] font-semibold shadow-sm border border-[#E5E4DE]">
                            {auction.item.category.name}
                          </span>
                        </div>
                      )}

                      {/* AI Verification Badge */}
                      {auction.item?.aiReport && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="claude-badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shadow-sm">
                            🛡️ {auction.item.aiReport.trustScore}/100 AI VERIFIED
                          </span>
                        </div>
                      )}

                      {/* Buyout badge */}
                      {auction.buyNowPrice && auction.status === "ACTIVE" && (
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="claude-badge bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold shadow-sm">
                            Mua Ngay: ${auction.buyNowPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between text-xs text-[#6B6A66] mb-1.5">
                        <span className="font-medium px-2 py-0.5 rounded bg-[#F0EFEA] text-[11px]">
                          {auction.item?.declaredCondition ?? "Đã kiểm định"}
                        </span>
                        <span className="text-[11px]">
                          {auction.totalBids ?? 0} lượt đặt giá
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#1F1E1D] line-clamp-1 group-hover:text-[#D97757] transition-colors">
                        <Link href={`/auctions/${auction.id}`}>{auction.item?.title}</Link>
                      </h3>

                      <p className="text-xs text-[#6B6A66] line-clamp-2 mt-1 leading-relaxed">
                        {auction.item?.description}
                      </p>
                    </div>
                  </div>

                  {/* Price & Action Section */}
                  <div className="p-4 sm:p-5 pt-3 border-t border-[#E5E4DE] bg-[#FAF9F5] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A66] block">
                          Giá hiện tại
                        </span>
                        <span className="text-xl font-extrabold text-[#1F1E1D]">
                          ${auction.currentPrice?.toLocaleString() ?? auction.startPrice?.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6B6A66] block mb-0.5">
                          {auction.status === "UPCOMING" ? "Bắt đầu sau" : "Thời gian còn"}
                        </span>
                        {auction.status === "ACTIVE" ? (
                          <CountdownTimer
                            targetDate={auction.endTime}
                            compact
                            className="text-xs font-mono font-bold text-[#D97757]"
                          />
                        ) : (
                          <span className="text-xs font-medium text-[#6B6A66]">
                            {auction.status === "UPCOMING" ? "Chưa mở" : "Đã đóng phiên"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dual Action: View Free vs Bid Protected */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href={`/auctions/${auction.id}`}
                        className="claude-btn claude-btn-secondary text-xs py-2 font-semibold text-center"
                      >
                        👁️ Xem Chi Tiết
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleProtectedAction("BID", auction.id)}
                        className="claude-btn claude-btn-primary text-xs py-2 font-semibold text-center"
                      >
                        {auction.status === "ACTIVE" ? "🎯 Đặt Giá" : "Xem Phiên"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4-Step Verification Guide (How it works) */}
      <section className="bg-white border-y border-[#E5E4DE] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold text-[#D97757] uppercase tracking-wider">
              ✦ TIÊU CHUẨN ĐẤU GIÁ TIN CẬY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1E1D] mt-1">
              4 Bước Đấu Giá Minh Bạch Tại VeryBid
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6A66] mt-2">
              Bảo vệ cả người bán và người mua bằng cơ chế kiểm định kép giữa trí tuệ nhân tạo và chuyên gia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E4DE] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center font-bold text-sm text-[#1F1E1D]">
                01
              </div>
              <h3 className="font-bold text-sm text-[#1F1E1D]">Chụp 5 góc chi tiết</h3>
              <p className="text-xs text-[#6B6A66] leading-relaxed">
                Người bán tải lên hình ảnh Mặt trước, Mặt sau, Tem serial, Hộp đựng và Chi tiết vết xước.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E4DE] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center font-bold text-sm text-[#D97757]">
                02
              </div>
              <h3 className="font-bold text-sm text-[#1F1E1D]">AI Vision đối soát</h3>
              <p className="text-xs text-[#6B6A66] leading-relaxed">
                Gemini Vision tự động quét vết trầy xước, phân tích số serial và cấp chứng thư Trust Score.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E4DE] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center font-bold text-sm text-[#1F1E1D]">
                03
              </div>
              <h3 className="font-bold text-sm text-[#1F1E1D]">Kiểm duyệt viên mở sàn</h3>
              <p className="text-xs text-[#6B6A66] leading-relaxed">
                Hội đồng thẩm định độc lập rà soát lại thông số AI trước khi kích hoạt phiên lên sàn công khai.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#E5E4DE] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E4DE] flex items-center justify-center font-bold text-sm text-[#15803D]">
                04
              </div>
              <h3 className="font-bold text-sm text-[#1F1E1D]">Đấu giá thời gian thực</h3>
              <p className="text-xs text-[#6B6A66] leading-relaxed">
                Trải nghiệm đặt giá tức thì qua WebSocket với cơ chế Soft-Close gia hạn +2 phút chống bắn tỉa bot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E5E4DE] bg-[#FAF9F5] py-8 text-xs text-[#6B6A66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#D97757] text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <span className="font-bold text-[#1F1E1D]">VERYBID PLATFORM</span>
            <span className="text-[#9E9D96]">•</span>
            <span>AI-Powered Verified Collectibles Auctions</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/auctions" className="hover:text-[#1F1E1D]">
              Sàn Đấu Giá
            </Link>
            <button
              onClick={() => handleProtectedAction("SELL")}
              className="hover:text-[#1F1E1D]"
            >
              Đăng Bán
            </button>
            <span className="text-[#9E9D96]">© 2026 VeryBid. Thiết kế Claude Light Theme.</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal Guard */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        description={authModalDescription}
        onSuccess={() => {
          loadAuctions();
        }}
      />
    </div>
  );
}
