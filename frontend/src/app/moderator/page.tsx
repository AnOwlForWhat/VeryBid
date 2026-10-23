"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { auctionApi } from "@/services/auctionApi";
import { Item, ImageAngle } from "@/types/auction";

export default function ModeratorDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedAngleImage, setSelectedAngleImage] = useState<string>("");
  const [activeAngleTab, setActiveAngleTab] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Decision state
  const [moderatorNote, setModeratorNote] = useState<string>("");
  const [createAuctionOnApprove, setCreateAuctionOnApprove] = useState<boolean>(true);
  const [auctionStartPrice, setAuctionStartPrice] = useState<string>("");
  const [auctionStepPrice, setAuctionStepPrice] = useState<string>("");
  const [auctionBuyNowPrice, setAuctionBuyNowPrice] = useState<string>("");
  const [auctionDurationHours, setAuctionDurationHours] = useState<number>(48);

  const loadPendingItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items = await auctionApi.getPendingItems();
      setPendingItems(items);
      if (items.length > 0) {
        selectItemForReview(items[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (err: unknown) {
      console.error("Failed to load pending items", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Không thể tải danh sách hồ sơ kiểm duyệt.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingItems();
  }, [loadPendingItems]);

  const selectItemForReview = (item: Item) => {
    setSelectedItem(item);
    setSuccessMessage(null);
    setErrorMessage(null);
    setModeratorNote(item.aiReport?.moderatorNote || "");

    const start = item.suggestedStartingPrice || 100;
    setAuctionStartPrice(start.toString());
    setAuctionStepPrice(Math.max(5, Math.round(start * 0.05)).toString());
    setAuctionBuyNowPrice(
      item.aiReport?.marketPriceMax ? item.aiReport.marketPriceMax.toString() : (start * 2).toString()
    );

    const initialImg =
      item.images?.find((img) => img.isThumbnail)?.imageUrl ||
      item.images?.[0]?.imageUrl ||
      "";
    setSelectedAngleImage(initialImg);
    setActiveAngleTab(item.images?.[0]?.angle || "FRONT");
  };

  const handleSelectAngle = (angle: ImageAngle, url: string) => {
    setActiveAngleTab(angle);
    setSelectedAngleImage(url);
  };

  const handleReviewAction = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedItem) return;

    setIsActionLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await auctionApi.reviewItem(selectedItem.id, {
        status,
        moderatorNote: moderatorNote.trim() || undefined,
        createAuction: status === "APPROVED" ? createAuctionOnApprove : false,
        startPrice: auctionStartPrice ? parseFloat(auctionStartPrice) : undefined,
        stepPrice: auctionStepPrice ? parseFloat(auctionStepPrice) : undefined,
        buyNowPrice: auctionBuyNowPrice ? parseFloat(auctionBuyNowPrice) : undefined,
        durationHours: auctionDurationHours,
      });

      setSuccessMessage(
        status === "APPROVED"
          ? `Đã phê duyệt sản phẩm "${updated.title}" thành công${
              createAuctionOnApprove ? " và tạo phiên đấu giá lên sàn!" : "."
            }`
          : `Đã từ chối sản phẩm "${updated.title}".`
      );

      const remaining = pendingItems.filter((i) => i.id !== selectedItem.id);
      setPendingItems(remaining);
      if (remaining.length > 0) {
        selectItemForReview(remaining[0]);
      } else {
        setSelectedItem(null);
      }
    } catch (err: unknown) {
      console.error("Action failed", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Thao tác kiểm duyệt thất bại. Vui lòng thử lại.");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReAppraise = async () => {
    if (!selectedItem) return;
    setIsActionLoading(true);
    try {
      const updated = await auctionApi.reAppraiseItem(selectedItem.id);
      setSelectedItem(updated);
      setSuccessMessage("AI Gemini Vision đã hoàn thành thẩm định lại toàn diện.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-4 px-2 sm:px-6 flex flex-col justify-between">
      <div className="retro-window max-w-7xl mx-auto w-full mb-8">
        <Navbar />

        {/* Sub Header Bar */}
        <div className="p-4 border-b-2 border-black bg-[#f6f6f5] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-neutral-600 mb-1">
              [PANEL::MODERATOR] • {user ? `Kiểm duyệt viên: ${user.fullName}` : "Hàng đợi thẩm định"}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-3">
              <span>BAN KIỂM DUYỆT VẬT PHẨM</span>
              <span className="retro-badge bg-black text-white px-2 py-0.5 text-sm">
                {pendingItems.length} CHỜ DUYỆT
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadPendingItems}
              disabled={isLoading}
              className="retro-btn text-xs py-1.5 px-3"
            >
              🔄 [RELOAD]
            </button>
            <Link
              href="/sell"
              className="retro-btn bg-[#fef08a] text-xs py-1.5 px-3 font-bold"
            >
              + [NỘP MÓN ĐỒ MỚI]
            </Link>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Auth prompt if not logged in */}
          {!authLoading && !isAuthenticated && (
            <div className="retro-box p-4 bg-[#fffbeb] border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-black font-bold">
                ⚠ Bạn chưa đăng nhập tài khoản Quản trị / Kiểm duyệt viên.
              </div>
              <Link
                href="/auth/login"
                className="retro-btn bg-black text-white text-xs px-4 py-1.5"
              >
                Đăng nhập Admin
              </Link>
            </div>
          )}

          {/* Notifications */}
          {successMessage && (
            <div className="retro-box p-3 bg-[#f0fdf4] border-2 border-black flex items-center justify-between text-sm font-bold text-black">
              <span>✓ {successMessage}</span>
              <button
                onClick={() => setSuccessMessage(null)}
                className="retro-btn text-xs px-2 py-0.5"
              >
                [X]
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="retro-box p-3 bg-[#fef2f2] border-2 border-black flex items-center justify-between text-sm font-bold text-black">
              <span>⚠ {errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="retro-btn text-xs px-2 py-0.5"
              >
                [X]
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="retro-box p-12 text-center bg-white">
              <div className="text-xl font-bold tracking-widest animate-pulse">
                [... ĐANG TẢI DỮ LIỆU KIỂM DUYỆT ...]
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && pendingItems.length === 0 && (
            <div className="retro-box p-12 text-center bg-white space-y-4">
              <div className="text-4xl">✿</div>
              <h3 className="text-xl font-black text-black">HÀNG ĐỢI KIỂM DUYỆT ĐANG TRỐNG</h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Tất cả các sản phẩm do người bán nộp đều đã được kiểm duyệt hoặc chưa có hồ sơ mới.
              </p>
              <div className="pt-2">
                <Link href="/sell" className="retro-btn bg-[#fef08a] px-6 py-2 font-bold inline-block">
                  → Nộp thử sản phẩm kiểm định
                </Link>
              </div>
            </div>
          )}

          {/* Main Review Layout */}
          {!isLoading && pendingItems.length > 0 && selectedItem && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Queue Column */}
              <div className="lg:col-span-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  ▶ DANH SÁCH CHỜ DUYỆT ({pendingItems.length})
                </div>

                <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
                  {pendingItems.map((item) => {
                    const isSelected = item.id === selectedItem.id;
                    const thumb =
                      item.images?.find((img) => img.isThumbnail)?.imageUrl ||
                      item.images?.[0]?.imageUrl ||
                      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80";
                    const score = item.aiReport?.trustScore;

                    return (
                      <div
                        key={item.id}
                        onClick={() => selectItemForReview(item)}
                        className={`retro-box p-3 cursor-pointer transition ${
                          isSelected ? "bg-[#fef08a] border-2" : "bg-white hover:bg-[#fafaf9]"
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 border-2 border-black flex-shrink-0 bg-neutral-100 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[11px] font-bold text-neutral-700 truncate">
                                  [{item.category?.name || "SƯU TẦM"}]
                                </span>
                                {score !== undefined && (
                                  <span className="retro-badge bg-black text-white text-[10px] px-1">
                                    {score}/100
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-black truncate">{item.title}</h4>
                            </div>
                            <div className="flex items-center justify-between text-xs text-neutral-600 font-bold">
                              <span>${item.suggestedStartingPrice?.toFixed(0)}</span>
                              <span className="text-[10px]">{item.images?.length || 0} góc ảnh</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Detailed Audit Column */}
              <div className="lg:col-span-8 space-y-6">
                {/* Item Details Box */}
                <div className="retro-box p-5 bg-white space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs">
                        <span className="retro-badge bg-black text-white px-2 py-0.5">
                          {selectedItem.category?.name}
                        </span>
                        <span className="text-neutral-600">
                          Người bán: <strong className="text-black">{selectedItem.sellerName}</strong>
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-black uppercase">
                        {selectedItem.title}
                      </h2>
                    </div>

                    <div className="retro-box p-3 bg-[#fef08a] border-2 border-black flex items-center gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-wider">
                          GEMINI TRUST SCORE
                        </div>
                        <div className="text-2xl font-black">
                          {selectedItem.aiReport?.trustScore ?? 80}
                          <span className="text-xs font-normal">/100</span>
                        </div>
                      </div>
                      <div className="text-2xl">🛡️</div>
                    </div>
                  </div>

                  {/* Multi-Angle Photo Inspector */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        ▶ THƯ VIỆN GÓC ẢNH KIỂM TRA ({selectedItem.images?.length || 0} ẢNH)
                      </span>
                      <button
                        type="button"
                        onClick={handleReAppraise}
                        disabled={isActionLoading}
                        className="retro-btn text-xs px-2.5 py-0.5 disabled:opacity-50"
                      >
                        🔄 [CHẠY LẠI GEMINI VISION]
                      </button>
                    </div>

                    {/* Main Viewer */}
                    {selectedAngleImage ? (
                      <div className="relative h-72 sm:h-96 w-full border-2 border-black bg-neutral-100 flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedAngleImage}
                          alt="Audited Angle"
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute bottom-2 left-2 text-xs font-bold px-2 py-0.5 bg-black text-white border border-black">
                          GÓC: {activeAngleTab}
                        </span>
                      </div>
                    ) : (
                      <div className="h-48 border-2 border-black bg-neutral-100 flex items-center justify-center text-neutral-500 text-xs">
                        [Không có ảnh nào được tải lên]
                      </div>
                    )}

                    {/* Angle Switcher Tabs */}
                    {selectedItem.images && selectedItem.images.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        {selectedItem.images.map((img, idx) => {
                          const isActive = activeAngleTab === img.angle;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectAngle(img.angle, img.imageUrl)}
                              className={`retro-box p-1 text-left transition ${
                                isActive ? "bg-[#fef08a] border-2" : "bg-white"
                              }`}
                            >
                              <div className="h-12 w-full border border-black overflow-hidden bg-neutral-100 mb-1">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.imageUrl} alt={img.angle} className="w-full h-full object-cover" />
                              </div>
                              <div className="text-[10px] font-bold truncate text-center uppercase">
                                {img.angle}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Comparison Side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Seller Claim */}
                    <div className="retro-box p-4 bg-[#fbfbfa] space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider block border-b border-black pb-1">
                        [THÔNG TIN NGƯỜI BÁN KHAI BÁO]
                      </span>
                      <div className="text-xs space-y-1.5 pt-1">
                        <div>
                          <span className="text-neutral-500 block">Tình trạng khai:</span>
                          <span className="font-bold text-black">
                            {selectedItem.declaredCondition || "Không khai báo"}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Giá khởi điểm kỳ vọng:</span>
                          <span className="font-bold text-black text-sm">
                            ${selectedItem.suggestedStartingPrice?.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Mô tả người bán:</span>
                          <p className="text-neutral-800 text-xs leading-relaxed mt-0.5 line-clamp-3">
                            {selectedItem.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* AI Findings */}
                    <div className="retro-box p-4 bg-[#fbfbfa] space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider block border-b border-black pb-1">
                        [AI GEMINI VISION KẾT LUẬN]
                      </span>
                      <div className="text-xs space-y-1.5 pt-1">
                        <div>
                          <span className="text-neutral-500 block">Model AI nhận diện:</span>
                          <span className="font-bold text-black">
                            {selectedItem.aiReport?.identifiedModel || selectedItem.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Tình trạng AI đánh giá:</span>
                          <span className="font-bold text-black">
                            {selectedItem.aiReport?.conditionRate || "Chưa có"}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block">Ước lượng định giá thị trường:</span>
                          <span className="font-bold text-black text-sm">
                            ${selectedItem.aiReport?.marketPriceMin?.toFixed(2)} - $
                            {selectedItem.aiReport?.marketPriceMax?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk & Authenticity Flags */}
                  {selectedItem.aiReport?.riskFlags && selectedItem.aiReport.riskFlags.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        TIÊU CHÍ XÁC THỰC (RISK & AUTHENTICITY FLAGS):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.aiReport.riskFlags.map((flag, idx) => (
                          <span key={idx} className="retro-badge bg-white text-black px-2 py-0.5 text-xs">
                            ✓ {flag.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderator Decision Action Box */}
                <div className="retro-box p-5 bg-white space-y-5">
                  <h3 className="text-base font-black text-black uppercase flex items-center gap-2 border-b-2 border-black pb-2">
                    <span>⚖ PHÁN QUYẾT CỦA BAN KIỂM DUYỆT</span>
                  </h3>

                  {/* Note */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">
                      Ghi chú kiểm duyệt (Moderator Note - Seller sẽ nhận được nội dung này):
                    </label>
                    <input
                      type="text"
                      value={moderatorNote}
                      onChange={(e) => setModeratorNote(e.target.value)}
                      placeholder="VD: Tem mác trùng khớp số serial, hình ảnh góc chụp chuẩn xác, chấp thuận lên sàn."
                      className="retro-input w-full"
                    />
                  </div>

                  {/* Auto launch auction configuration */}
                  <div className="retro-box p-4 bg-[#fbfbfa] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-black flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createAuctionOnApprove}
                          onChange={(e) => setCreateAuctionOnApprove(e.target.checked)}
                          className="w-4 h-4 border-2 border-black"
                        />
                        <span>TỰ ĐỘNG KÍCH HOẠT PHIÊN ĐẤU GIÁ LÊN SÀN NGAY KHI DUYỆT</span>
                      </label>
                      <span className="retro-badge bg-[#fef08a] text-black text-[10px]">KHUYÊN DÙNG</span>
                    </div>

                    {createAuctionOnApprove && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-black">
                        <div>
                          <span className="text-[10px] font-bold block mb-1">GIÁ KHỞI ĐIỂM ($)</span>
                          <input
                            type="number"
                            value={auctionStartPrice}
                            onChange={(e) => setAuctionStartPrice(e.target.value)}
                            className="retro-input w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block mb-1">BƯỚC GIÁ ($)</span>
                          <input
                            type="number"
                            value={auctionStepPrice}
                            onChange={(e) => setAuctionStepPrice(e.target.value)}
                            className="retro-input w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block mb-1">GIÁ MUA NGAY ($)</span>
                          <input
                            type="number"
                            value={auctionBuyNowPrice}
                            onChange={(e) => setAuctionBuyNowPrice(e.target.value)}
                            className="retro-input w-full text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block mb-1">THỜI LƯỢNG</span>
                          <select
                            value={auctionDurationHours}
                            onChange={(e) => setAuctionDurationHours(Number(e.target.value))}
                            className="retro-select w-full text-xs"
                          >
                            <option value={24}>24 Giờ (1 Ngày)</option>
                            <option value={48}>48 Giờ (2 Ngày)</option>
                            <option value={72}>72 Giờ (3 Ngày)</option>
                            <option value={168}>7 Ngày</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleReviewAction("APPROVED")}
                      className="retro-btn flex-1 py-3 bg-[#fef08a] font-black text-sm uppercase disabled:opacity-50"
                    >
                      ✓ PHÊ DUYỆT SẢN PHẨM [APPROVE]
                    </button>

                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={() => handleReviewAction("REJECTED")}
                      className="retro-btn px-6 py-3 bg-white text-black font-black text-sm uppercase disabled:opacity-50"
                    >
                      ✕ TỪ CHỐI [REJECT]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-neutral-600">
        ✿ 2026 VERYBID AI-OS MODERATION PROTOCOL • CONCURRENCY & MULTI-ANGLE VERIFICATION ✿
      </footer>
    </div>
  );
}
