"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { AuctionTimelineBar } from "@/components/AuctionTimelineBar";
import { HistoricalAuctionResultCard } from "@/components/HistoricalAuctionResultCard";
import { auctionApi } from "@/services/auctionApi";
import { Auction, AuctionStatus, Category, PageResponse } from "@/types/auction";

export default function AuctionCatalogPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AuctionStatus | "ALL">("ALL");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [pagination, setPagination] = useState<PageResponse<Auction> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await auctionApi.getCategories();
        setCategories(data);
      } catch (err: unknown) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch auctions with optional date filter
  const loadAuctions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await auctionApi.getAuctions({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        categoryId: selectedCategory ?? undefined,
        keyword: searchKeyword.trim() ? searchKeyword.trim() : undefined,
        date: selectedDate ?? undefined,
        page,
        size: 9,
      });
      setAuctions(data.content);
      setPagination(data);
    } catch (err: unknown) {
      console.error("Failed to load auctions", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Lỗi kết nối khi tải danh sách phiên đấu giá.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedCategory, searchKeyword, selectedDate, page]);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadAuctions();
  };

  const handleSelectTimelineDate = (date: string | null) => {
    setSelectedDate(date);
    setPage(0);

    // If picking a past date, default status to ENDED if currently ACTIVE
    if (date) {
      const picked = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (picked < today && selectedStatus === "ACTIVE") {
        setSelectedStatus("ENDED");
      }
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
          <span className="claude-badge bg-[#1F1E1D] text-white text-[11px] font-bold">
            ✓ ĐÃ GÕ BÚA
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Page Top Header Bar */}
        <div className="p-6 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D97757] mb-1">
              <span>🏛️</span> SÀN ĐẤU GIÁ VẬT PHẨM SƯU TẦM
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1E1D]">
              Kho Đấu Giá Trực Tiếp & Lịch Sử Kết Quả
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6A66] mt-1 max-w-2xl leading-relaxed">
              Theo dõi diễn biến thời gian thực, đặt giá bảo chứng bởi AI hoặc tra cứu kết quả các phiên đã gõ búa trong lịch sử.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="claude-btn claude-btn-primary font-semibold text-xs py-2.5 px-4 shadow-sm"
            >
              + Đăng Bán Sản Phẩm
            </Link>
          </div>
        </div>

        {/* 1. Auction Date Timeline Bar (Thanh lịch trình ngày đấu giá) */}
        <AuctionTimelineBar
          selectedDate={selectedDate}
          onSelectDate={handleSelectTimelineDate}
        />

        {/* 2. Search, Status Tabs & Category Filters Bar */}
        <div className="p-4 sm:p-5 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm space-y-4">
          {/* Keyword Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9E9D96]">
                🔍
              </span>
              <input
                type="text"
                placeholder="Tìm theo tên mô hình, dòng máy vintage, sneaker, đồng hồ, tranh nghệ thuật..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="claude-input pl-9"
              />
            </div>
            <button type="submit" className="claude-btn claude-btn-primary text-xs px-4 font-semibold">
              Tìm Kiếm
            </button>
            {searchKeyword && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  setPage(0);
                }}
                className="claude-btn claude-btn-secondary text-xs px-3"
              >
                Xóa
              </button>
            )}
          </form>

          {/* Status Tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E4DE]">
            <span className="text-xs font-semibold text-[#6B6A66] mr-1">Chế độ xem:</span>
            {(
              [
                { key: "ALL", label: "Tất cả phiên" },
                { key: "ACTIVE", label: "🔴 Đang diễn ra" },
                { key: "ENDED", label: "🏆 Kết quả đã chốt (Historical)" },
                { key: "UPCOMING", label: "⏳ Sắp diễn ra" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSelectedStatus(tab.key);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedStatus === tab.key
                    ? "bg-[#1F1E1D] text-white shadow-sm"
                    : "bg-[#F5F5F0] text-[#6B6A66] hover:bg-[#EAE8E1] hover:text-[#1F1E1D]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E4DE]">
            <span className="text-xs font-semibold text-[#6B6A66] mr-1">Danh mục:</span>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-[#D97757] text-white shadow-sm font-semibold"
                  : "bg-[#F5F5F0] text-[#6B6A66] hover:bg-[#EAE8E1] hover:text-[#1F1E1D]"
              }`}
            >
              Tất cả danh mục
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-[#D97757] text-white shadow-sm font-semibold"
                    : "bg-[#F5F5F0] text-[#6B6A66] hover:bg-[#EAE8E1] hover:text-[#1F1E1D]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Filter Stats Bar */}
        <div className="flex items-center justify-between text-xs text-[#6B6A66] px-1">
          <div>
            Tìm thấy <strong className="text-[#1F1E1D]">{pagination?.totalElements ?? auctions.length}</strong> phiên đấu giá
            {selectedDate && (
              <span>
                {" "}cho ngày <strong className="text-[#D97757]">{selectedDate}</strong>
              </span>
            )}
            {selectedStatus === "ENDED" && <span> • 🏆 Danh sách kết quả gõ búa</span>}
          </div>

          {(selectedDate || selectedCategory !== null || selectedStatus !== "ALL" || searchKeyword) && (
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setSelectedCategory(null);
                setSelectedStatus("ALL");
                setSearchKeyword("");
                setPage(0);
              }}
              className="text-xs text-[#D97757] hover:underline font-semibold"
            >
              Đặt lại tất cả bộ lọc
            </button>
          )}
        </div>

        {/* 4. Main Auction Grid or Historical Results Cards */}
        {isLoading ? (
          <div className="py-24 text-center bg-white border border-[#E5E4DE] rounded-2xl">
            <div className="inline-block animate-spin text-2xl mb-2">⌛</div>
            <div className="text-sm font-semibold text-[#1F1E1D]">Đang tải dữ liệu phiên đấu giá...</div>
            <p className="text-xs text-[#6B6A66] mt-1">Đồng bộ tỷ giá và lịch trình thời gian thực</p>
          </div>
        ) : errorMessage ? (
          <div className="p-8 text-center bg-[#FEE2E2] border border-[#FECACA] rounded-2xl">
            <div className="font-bold text-[#991B1B] text-base mb-1">Không thể tải dữ liệu</div>
            <p className="text-xs text-[#991B1B] mb-4">{errorMessage}</p>
            <button onClick={loadAuctions} className="claude-btn claude-btn-secondary text-xs">
              Thử Lại
            </button>
          </div>
        ) : auctions.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-3">
            <div className="text-4xl mb-1">🔍</div>
            <h3 className="text-base font-bold text-[#1F1E1D]">
              {selectedStatus === "ENDED"
                ? "Không có kết quả đấu giá nào trong ngày đã chọn"
                : "Không tìm thấy phiên đấu giá nào phù hợp"}
            </h3>
            <p className="text-xs text-[#6B6A66] max-w-md mx-auto leading-relaxed">
              {selectedDate
                ? `Ngày ${selectedDate} hiện không có phiên nào khớp với bộ lọc. Bạn có thể chọn ngày khác trên thanh lịch trình hoặc xem tất cả.`
                : "Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  setSelectedCategory(null);
                  setSelectedStatus("ALL");
                  setSearchKeyword("");
                  setPage(0);
                }}
                className="claude-btn claude-btn-primary text-xs"
              >
                Xem Tất Cả Các Ngày
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const y = today.getFullYear();
                  const m = String(today.getMonth() + 1).padStart(2, "0");
                  const d = String(today.getDate()).padStart(2, "0");
                  handleSelectTimelineDate(`${y}-${m}-${d}`);
                }}
                className="claude-btn claude-btn-secondary text-xs"
              >
                Xem Phiên Hôm Nay
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => {
              // If auction is ENDED, render the specialized Historical Result Card
              if (auction.status === "ENDED") {
                return (
                  <HistoricalAuctionResultCard
                    key={auction.id}
                    auction={auction}
                  />
                );
              }

              // Otherwise, render live interactive card
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

                    {/* Action button */}
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="w-full claude-btn claude-btn-primary text-xs py-2 font-semibold text-center block"
                    >
                      {auction.status === "ACTIVE" ? "👉 VÀO PHÒNG ĐẤU GIÁ" : "XEM CHI TIẾT"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="claude-btn claude-btn-secondary text-xs disabled:opacity-40"
            >
              ← Trang Trước
            </button>

            <span className="text-xs font-medium text-[#6B6A66] px-3 py-1 bg-white border border-[#E5E4DE] rounded-lg">
              Trang <strong className="text-[#1F1E1D]">{page + 1}</strong> / {pagination.totalPages}
            </span>

            <button
              disabled={page + 1 >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="claude-btn claude-btn-secondary text-xs disabled:opacity-40"
            >
              Trang Kế →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E4DE] bg-[#FAF9F5] py-8 text-xs text-[#6B6A66] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#D97757] text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <span className="font-bold text-[#1F1E1D]">VERYBID AUCTION CATALOG</span>
            <span className="text-[#9E9D96]">•</span>
            <span>Lịch Trình & Kết Quả Đấu Giá Minh Bạch</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#1F1E1D]">
              Trang Chủ
            </Link>
            <Link href="/sell" className="hover:text-[#1F1E1D]">
              Đăng Bán
            </Link>
            <span className="text-[#9E9D96]">© 2026 VeryBid.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
