"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { auctionApi } from "@/services/auctionApi";
import { Auction, AuctionStatus, Category, PageResponse } from "@/types/auction";

export default function AuctionCatalogPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AuctionStatus | "ALL">("ACTIVE");
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

  // Fetch auctions
  const loadAuctions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await auctionApi.getAuctions({
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        categoryId: selectedCategory ?? undefined,
        keyword: searchKeyword.trim() ? searchKeyword.trim() : undefined,
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
        setErrorMessage("An unexpected error occurred while fetching auctions.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, selectedCategory, searchKeyword, page]);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadAuctions();
  };

  const getStatusBadge = (status: AuctionStatus) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="retro-badge bg-emerald-100 text-emerald-900 border-black font-bold">
            <span className="status-dot status-dot-online"></span>
            LIVE NOW
          </span>
        );
      case "UPCOMING":
        return (
          <span className="retro-badge bg-blue-100 text-blue-900 border-black font-bold">
            <span className="status-dot status-dot-busy"></span>
            UPCOMING
          </span>
        );
      case "ENDED":
        return (
          <span className="retro-badge bg-gray-200 text-gray-700 border-black">
            ENDED
          </span>
        );
      default:
        return (
          <span className="retro-badge bg-gray-100 border-black font-mono">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#ededec] flex flex-col justify-between p-2 sm:p-4">
      {/* Outer Retro Window */}
      <div className="retro-window max-w-6xl mx-auto w-full">
        <Navbar />

        <main className="p-4 sm:p-6">
          {/* Header Bar */}
          <div className="retro-box p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase font-bold text-gray-600 mb-0.5">
                DATABASE: AUCTIONS_TABLE • REAL-TIME CATALOG
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Sàn Đấu Giá Vật Phẩm Sưu Tầm & Hàng Hiếm
              </h1>
            </div>

            <Link href="/sell" className="retro-btn retro-btn-primary font-bold">
              + Đăng Bán Sản Phẩm (AI Thẩm Định)
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="retro-box p-4 mb-6 space-y-4 bg-gray-50">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập tên mô hình, dòng máy vintage, sneaker cần tìm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="retro-input flex-1"
              />
              <button type="submit" className="retro-btn retro-btn-primary font-bold">
                Tìm Kiếm
              </button>
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setPage(0);
                  }}
                  className="retro-btn bg-white"
                >
                  Xóa
                </button>
              )}
            </form>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-300">
              <span className="text-sm font-bold self-center mr-2">Trạng thái:</span>
              {(["ALL", "ACTIVE", "UPCOMING", "ENDED"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setPage(0);
                  }}
                  className={`retro-btn text-sm ${
                    selectedStatus === status
                      ? "retro-btn-dark font-bold"
                      : "bg-white"
                  }`}
                >
                  {status === "ALL"
                    ? "Tất cả"
                    : status === "ACTIVE"
                    ? "🔴 Đang diễn ra"
                    : status === "UPCOMING"
                    ? "⏳ Sắp diễn ra"
                    : "Đã kết thúc"}
                </button>
              ))}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-300">
              <span className="text-sm font-bold self-center mr-2">Danh mục:</span>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(0);
                }}
                className={`retro-btn text-sm ${
                  selectedCategory === null
                    ? "retro-btn-dark font-bold"
                    : "bg-white"
                }`}
              >
                Tất cả danh mục
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setPage(0);
                  }}
                  className={`retro-btn text-sm ${
                    selectedCategory === cat.id
                      ? "retro-btn-dark font-bold"
                      : "bg-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Auction Cards Grid */}
          {isLoading ? (
            <div className="text-center py-20 retro-box">
              <div className="text-3xl mb-2 font-mono">⌛ [ LOADING CATALOG DATA... ]</div>
              <p className="text-sm text-gray-600">Đang đồng bộ dữ liệu phiên đấu giá từ máy chủ...</p>
            </div>
          ) : errorMessage ? (
            <div className="retro-box p-6 text-center bg-rose-50 border-rose-600">
              <div className="font-bold text-rose-700 text-lg mb-1">Lỗi tải dữ liệu</div>
              <p className="text-sm mb-4">{errorMessage}</p>
              <button onClick={loadAuctions} className="retro-btn">
                Thử Lại
              </button>
            </div>
          ) : auctions.length === 0 ? (
            <div className="retro-box p-12 text-center bg-white">
              <div className="text-4xl mb-2">🔍</div>
              <h3 className="text-xl font-bold mb-1">Không Tìm Thấy Phiên Đấu Giá Nào</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                Không có món đồ nào khớp với bộ lọc hiện tại. Thử đổi danh mục hoặc từ khóa tìm kiếm.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedStatus("ALL");
                  setSearchKeyword("");
                  setPage(0);
                }}
                className="retro-btn retro-btn-primary"
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
                    className="retro-box flex flex-col justify-between overflow-hidden bg-white"
                  >
                    {/* Top Thumbnail Box */}
                    <div>
                      <div className="relative aspect-[4/3] bg-gray-100 border-b-2 border-black overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnail}
                          alt={auction.item?.title ?? "Auction Item"}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2">
                          {getStatusBadge(auction.status)}
                        </div>

                        {auction.item?.category && (
                          <div className="absolute top-2 right-2">
                            <span className="retro-badge bg-white font-bold text-xs">
                              {auction.item.category.name}
                            </span>
                          </div>
                        )}

                        {auction.item?.aiReport && (
                          <div className="absolute bottom-2 left-2">
                            <span className="retro-badge bg-emerald-100 text-emerald-950 font-bold text-xs">
                              🛡️ {auction.item.aiReport.trustScore}/100 AI VERIFIED
                            </span>
                          </div>
                        )}

                        {auction.buyNowPrice && auction.status === "ACTIVE" && (
                          <div className="absolute bottom-2 right-2">
                            <span className="retro-badge bg-yellow-300 font-bold text-xs">
                              Buyout: ${auction.buyNowPrice.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="p-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span className="font-bold border border-black px-1.5 py-0.2 bg-gray-100">
                            {auction.item?.declaredCondition ?? "Inspected"}
                          </span>
                          <span>
                            {auction.totalBids ?? 0} {auction.totalBids === 1 ? "lượt bid" : "lượt bids"}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold truncate mt-1 hover:underline">
                          <Link href={`/auctions/${auction.id}`}>{auction.item?.title}</Link>
                        </h3>

                        <p className="text-sm text-gray-700 line-clamp-2 mt-1">
                          {auction.item?.description}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action Footer */}
                    <div className="p-4 pt-2 border-t-2 border-black bg-gray-50 flex items-center justify-between">
                      <div>
                        <span className="text-xs uppercase font-bold text-gray-600 block">
                          Giá hiện tại
                        </span>
                        <span className="text-2xl font-black text-black">
                          ${auction.currentPrice?.toLocaleString() ?? auction.startPrice?.toLocaleString()}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                          {auction.status === "UPCOMING" ? "Bắt đầu sau" : "Thời gian còn"}
                        </div>
                        {auction.status === "ACTIVE" ? (
                          <CountdownTimer targetDate={auction.endTime} className="text-sm font-mono font-bold text-red-700" />
                        ) : (
                          <span className="text-xs font-mono font-bold">
                            {auction.status === "UPCOMING" ? "Chưa mở" : "Đã đóng"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Button */}
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="retro-btn retro-btn-primary block text-center py-2 text-base font-bold border-t-2 border-black border-x-0 border-b-0 shadow-none hover:shadow-none hover:bg-yellow-400"
                    >
                      {auction.status === "ACTIVE" ? "👉 VÀO PHÒNG ĐẤU GIÁ" : "XEM CHI TIẾT"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="retro-btn text-sm disabled:opacity-40"
              >
                ← Trang Trước
              </button>

              <span className="retro-badge px-3 py-1 font-bold">
                Trang {page + 1} / {pagination.totalPages}
              </span>

              <button
                disabled={page + 1 >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="retro-btn text-sm disabled:opacity-40"
              >
                Trang Kế →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
