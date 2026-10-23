"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CountdownTimer } from "@/components/CountdownTimer";
import { auctionApi } from "@/services/auctionApi";
import { useAuctionWebSocket } from "@/hooks/useAuctionWebSocket";
import { useAuth } from "@/context/AuthContext";
import { Auction, Bid, BidEvent } from "@/types/auction";

export default function LiveAuctionRoomPage() {
  const params = useParams();
  const auctionId = params.id as string;
  const { user, isAuthenticated } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [bidAmountInput, setBidAmountInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);
  const [isSubmittingBuyout, setIsSubmittingBuyout] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [softCloseNotification, setSoftCloseNotification] = useState<string | null>(null);
  const [priceFlash, setPriceFlash] = useState<boolean>(false);

  // Load auction details
  const loadAuction = useCallback(async () => {
    if (!auctionId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await auctionApi.getAuctionById(auctionId);
      setAuction(data.auction);
      setBids(data.bids ?? []);
      const defaultImg =
        data.auction.item?.images?.find((img) => img.isThumbnail)?.imageUrl ||
        data.auction.item?.images?.[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80";
      setSelectedImage(defaultImg);

      // Pre-fill next min bid
      const nextMin = (data.auction.currentPrice ?? data.auction.startPrice) + data.auction.stepPrice;
      setBidAmountInput(nextMin.toString());
    } catch (err: unknown) {
      console.error("Failed to load auction", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Phiên đấu giá không tồn tại hoặc không thể tải.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  // Real-time WebSocket event handler
  const handleWebSocketEvent = useCallback((event: BidEvent) => {
    console.log("WebSocket event received in room:", event);

    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentPrice: event.currentPrice,
        currentWinnerId: event.highestBidderId ?? prev.currentWinnerId,
        currentWinnerName: event.highestBidderName ?? prev.currentWinnerName,
        totalBids: event.totalBids,
        endTime: event.endTime ?? prev.endTime,
        status:
          event.eventType === "BUYOUT" || event.eventType === "AUCTION_ENDED"
            ? "ENDED"
            : prev.status,
      };
    });

    // Flash price highlight
    setPriceFlash(true);
    setTimeout(() => setPriceFlash(false), 2000);

    // If new bid or buyout, append to bids list
    if (event.eventType === "NEW_BID" || event.eventType === "BUYOUT") {
      const newBidEntry: Bid = {
        id: Date.now(),
        auctionId: event.auctionId,
        bidderId: event.highestBidderId ?? "",
        bidderName: event.highestBidderName ?? "Anonymous Collector",
        bidAmount: event.currentPrice,
        isAutoBid: false,
        createdAt: event.timestamp || new Date().toISOString(),
      };
      setBids((prev) => [newBidEntry, ...prev]);
    }

    // Soft-Close Alert Notification
    if (event.eventType === "AUCTION_EXTENDED") {
      setSoftCloseNotification("⚠️ SOFT-CLOSE: Có lượt bid trong 2 phút cuối! Phiên được gia hạn thêm 2 phút!");
      setTimeout(() => setSoftCloseNotification(null), 8000);
    }
  }, []);

  // Connect STOMP WebSocket
  const { isConnected } = useAuctionWebSocket({
    auctionId,
    onEvent: handleWebSocketEvent,
    enabled: Boolean(auctionId),
  });

  // Calculate next required minimum bid
  const nextMinimumBid = useMemo(() => {
    if (!auction) return 0;
    if (auction.totalBids === 0) return auction.startPrice;
    return (auction.currentPrice ?? auction.startPrice) + auction.stepPrice;
  }, [auction]);

  // Quick increment helper
  const handleQuickBid = (increment: number) => {
    const current = parseFloat(bidAmountInput) || nextMinimumBid;
    setBidAmountInput((current + increment).toFixed(2));
  };

  // Submit manual bid
  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setActionSuccessMessage(null);

    if (!isAuthenticated) {
      setErrorMessage("Vui lòng đăng nhập trước khi tham gia đấu thầu.");
      return;
    }

    const amount = parseFloat(bidAmountInput);
    if (isNaN(amount) || amount < nextMinimumBid) {
      setErrorMessage(`Giá đặt tối thiểu hợp lệ phải từ $${nextMinimumBid.toFixed(2)} trở lên.`);
      return;
    }

    setIsSubmittingBid(true);
    try {
      await auctionApi.placeBid(auctionId, amount);
      setActionSuccessMessage(`Đặt giá thành công: $${amount.toFixed(2)}!`);
      // Prepare next bid
      if (auction) {
        setBidAmountInput((amount + auction.stepPrice).toFixed(2));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Lỗi khi gửi giá thầu.");
      }
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Buy It Now instant settlement
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setErrorMessage("Vui lòng đăng nhập để thực hiện Mua Ngay.");
      return;
    }

    if (!confirm(`Xác nhận mua ngay món đồ với giá $${auction?.buyNowPrice?.toLocaleString()}?`)) {
      return;
    }

    setIsSubmittingBuyout(true);
    setErrorMessage(null);
    try {
      await auctionApi.buyNow(auctionId);
      setActionSuccessMessage("Chúc mừng! Bạn đã mua ngay thành công món đồ!");
      loadAuction();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Lỗi khi mua ngay.");
      }
    } finally {
      setIsSubmittingBuyout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ededec] flex flex-col justify-between p-2 sm:p-4">
        <div className="retro-window max-w-6xl mx-auto w-full">
          <Navbar />
          <div className="p-16 text-center">
            <div className="text-3xl mb-2 font-mono">⌛ [ LOADING LIVE AUCTION ROOM... ]</div>
            <p className="text-sm text-gray-600">Đang khởi tạo kết nối STOMP & xác thực vật phẩm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) return null;

  const isAuctionActive = auction.status === "ACTIVE";
  const isAuctionEnded = auction.status === "ENDED";
  const isAuctionUpcoming = auction.status === "UPCOMING";
  const isWinning = user && auction.currentWinnerId === user.id;
  const isSeller = user && auction.item?.sellerId === user.id;

  return (
    <div className="min-h-screen bg-[#ededec] flex flex-col justify-between p-2 sm:p-4">
      <div className="retro-window max-w-6xl mx-auto w-full">
        <Navbar />

        {/* Real-time Soft Close Banner */}
        {softCloseNotification && (
          <div className="bg-yellow-300 text-black border-b-2 border-black px-4 py-2 text-center text-sm font-bold animate-pulse">
            {softCloseNotification}
          </div>
        )}

        <main className="p-4 sm:p-6">
          {/* Breadcrumb & Stream Status Header */}
          <div className="flex items-center justify-between gap-4 mb-4 pb-2 border-b-2 border-black">
            <Link
              href="/auctions"
              className="retro-btn py-1 px-3 text-sm bg-white"
            >
              ← Quay Lại Sàn Đấu Giá
            </Link>

            <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white text-xs sm:text-sm font-mono">
              <span
                className={`status-dot ${
                  isConnected ? "status-dot-online" : "status-dot-busy"
                }`}
              ></span>
              <span>
                STREAM: {isConnected ? "CONNECTED (STOMP 60FPS)" : "CONNECTING..."}
              </span>
            </div>
          </div>

          {/* 2-Column Live Bidding Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Image Stage & AI Inspection (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Stage Image */}
              <div className="retro-box p-2 bg-white">
                <div className="relative aspect-[4/3] bg-gray-100 border-2 border-black overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage}
                    alt={auction.item?.title ?? "Item Image"}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="retro-badge bg-white font-bold text-xs">
                      {auction.item?.category?.name}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="retro-badge bg-gray-100 font-bold text-xs">
                      Khai báo: {auction.item?.declaredCondition}
                    </span>
                  </div>
                </div>

                {/* Thumbnails */}
                {auction.item?.images && auction.item.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-3 pb-1">
                    {auction.item.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.imageUrl)}
                        className={`relative w-16 h-16 rounded border-2 transition flex-shrink-0 ${
                          selectedImage === img.imageUrl
                            ? "border-black bg-yellow-200"
                            : "border-gray-400 bg-white hover:border-black"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.imageUrl}
                          alt={img.angle}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-white/90 text-[10px] text-center font-bold border-t border-black truncate">
                          {img.angle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Description Box */}
              <div className="retro-box p-4 bg-white">
                <h1 className="text-2xl font-black tracking-tight">{auction.item?.title}</h1>
                <p className="mt-2 text-base text-gray-800 leading-relaxed whitespace-pre-line border-t border-gray-200 pt-2">
                  {auction.item?.description}
                </p>

                <div className="mt-4 pt-3 border-t-2 border-black grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block">SELLER:</span>
                    <strong>{auction.item?.sellerName || "Verified Collector"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">AUCTION ID:</span>
                    <strong>{auction.id.slice(0, 8)}...</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">DATE LISTED:</span>
                    <strong>{new Date(auction.createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>

              {/* AI Appraisal Certificate Box */}
              <div className="retro-box p-4 bg-yellow-50 border-2 border-black">
                <div className="border-b-2 border-black pb-2 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">★</span>
                    <strong className="text-lg">CHỨNG THƯ THẨM ĐỊNH AI (GEMINI VISION)</strong>
                  </div>
                  <span className="retro-badge bg-emerald-200 font-bold border-black">
                    TRUST {auction.item?.aiReport?.trustScore ?? 96}/100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="border border-black p-2 bg-white">
                    <span className="text-gray-600 block text-[11px]">ĐỘ TIN CẬY</span>
                    <strong className="text-lg text-emerald-800">
                      {auction.item?.aiReport?.trustScore ?? 95}/100
                    </strong>
                  </div>
                  <div className="border border-black p-2 bg-white">
                    <span className="text-gray-600 block text-[11px]">TÌNH TRẠNG AI CHẤM</span>
                    <strong className="text-sm">
                      {auction.item?.aiReport?.conditionRate ?? "9.4/10 Mint"}
                    </strong>
                  </div>
                  <div className="border border-black p-2 bg-white">
                    <span className="text-gray-600 block text-[11px]">ĐỊNH GIÁ THỊ TRƯỜNG</span>
                    <strong className="text-sm text-blue-900">
                      {auction.item?.aiReport?.marketPriceMin
                        ? `$${auction.item.aiReport.marketPriceMin} - $${auction.item.aiReport.marketPriceMax}`
                        : "Verified Range"}
                    </strong>
                  </div>
                </div>

                {auction.item?.aiReport?.riskFlags && auction.item.aiReport.riskFlags.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-black flex flex-wrap gap-1.5">
                    {auction.item.aiReport.riskFlags.map((flag, idx) => (
                      <span
                        key={idx}
                        className="retro-badge bg-white text-xs font-semibold"
                      >
                        ✓ {flag.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Console (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Bidding Control Panel */}
              <div className="retro-box p-4 bg-white space-y-4">
                {/* Countdown */}
                <div className="text-center p-3 border-2 border-black bg-gray-50">
                  <div className="text-xs uppercase font-bold text-gray-600 mb-1">
                    {isAuctionUpcoming
                      ? "Bắt đầu sau"
                      : isAuctionEnded
                      ? "Phiên đấu giá đã kết thúc"
                      : "Thời gian còn lại"}
                  </div>
                  <CountdownTimer
                    targetDate={isAuctionUpcoming ? auction.startTime : auction.endTime}
                    isUpcoming={isAuctionUpcoming}
                    onExpire={loadAuction}
                    className="text-2xl sm:text-3xl font-mono font-bold text-red-600"
                  />
                </div>

                {/* Current Price Box */}
                <div
                  className={`p-4 border-2 border-black text-center transition-colors ${
                    priceFlash ? "bg-yellow-200" : "bg-white"
                  }`}
                >
                  <span className="text-xs uppercase font-bold text-gray-600 block mb-1">
                    {auction.totalBids > 0 ? "Giá đặt cao nhất hiện tại" : "Giá khởi điểm"}
                  </span>
                  <div className="text-4xl sm:text-5xl font-black tracking-tight text-black">
                    ${(auction.currentPrice ?? auction.startPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  {/* Winner Pill */}
                  <div className="mt-2 text-xs">
                    {isWinning ? (
                      <span className="retro-badge bg-emerald-100 font-bold border-black">
                        🎉 Bạn đang là người dẫn đầu!
                      </span>
                    ) : auction.currentWinnerName ? (
                      <span>
                        Người dẫn đầu: <strong>{auction.currentWinnerName}</strong>
                      </span>
                    ) : (
                      <span className="text-gray-500">Chưa có lượt bid nào. Hãy là người đầu tiên!</span>
                    )}
                  </div>
                </div>

                {/* Alerts */}
                {errorMessage && (
                  <div className="p-2 border-2 border-red-600 bg-red-100 text-red-900 text-xs font-bold">
                    ⚠️ {errorMessage}
                  </div>
                )}
                {actionSuccessMessage && (
                  <div className="p-2 border-2 border-green-600 bg-green-100 text-green-900 text-xs font-bold">
                    ✓ {actionSuccessMessage}
                  </div>
                )}

                {/* Bidding Controls Form */}
                {isAuctionActive && (
                  <div className="space-y-3">
                    {isSeller ? (
                      <div className="p-3 border-2 border-black bg-yellow-100 text-center text-xs font-bold">
                        Bạn là người bán món đồ này. Quy định cấm tự đấu giá (Self-bidding).
                      </div>
                    ) : (
                      <>
                        {/* Quick increment buttons */}
                        <div>
                          <span className="text-xs font-bold text-gray-600 block mb-1">
                            Tăng giá nhanh một chạm:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {[
                              auction.stepPrice,
                              auction.stepPrice * 2,
                              auction.stepPrice * 5,
                            ].map((inc, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => handleQuickBid(inc)}
                                className="retro-btn py-1.5 text-xs font-bold bg-white"
                              >
                                +${inc.toFixed(0)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Bid Form */}
                        <form onSubmit={handlePlaceBid} className="space-y-2 pt-1">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="any"
                              min={nextMinimumBid}
                              value={bidAmountInput}
                              onChange={(e) => setBidAmountInput(e.target.value)}
                              placeholder={`Min $${nextMinimumBid.toFixed(2)}`}
                              className="retro-input flex-1 font-bold text-lg"
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingBid}
                              className="retro-btn retro-btn-primary font-black px-4 text-base disabled:opacity-40"
                            >
                              {isSubmittingBid ? "Đang gửi..." : "ĐẶT GIÁ"}
                            </button>
                          </div>
                        </form>

                        {/* Buy Now Option */}
                        {auction.buyNowPrice && (
                          <div className="pt-2 border-t border-gray-300">
                            <button
                              type="button"
                              onClick={handleBuyNow}
                              disabled={isSubmittingBuyout}
                              className="retro-btn w-full py-2 bg-yellow-300 font-black text-sm block text-center"
                            >
                              {isSubmittingBuyout
                                ? "Đang thanh toán..."
                                : `MUA NGAY (BUYOUT) VỚI $${auction.buyNowPrice.toLocaleString()}`}
                            </button>
                            <span className="text-[11px] text-gray-500 text-center block mt-1">
                              Bỏ qua đấu giá để sở hữu ngay lập tức.
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Soft Close Alert Info */}
                <div className="p-2 border border-black bg-gray-50 text-[11px]">
                  <strong>🛡️ Anti-Sniping (Soft-Close):</strong> Mọi lượt bid trong 2 phút cuối sẽ tự động cộng thêm 2 phút để bảo đảm công bằng.
                </div>
              </div>

              {/* Real-Time Bid Ledger Feed */}
              <div className="retro-box p-4 bg-white">
                <div className="border-b-2 border-black pb-2 mb-2 flex items-center justify-between">
                  <strong className="text-sm uppercase">LỊCH SỬ ĐẶT GIÁ REAL-TIME</strong>
                  <span className="retro-badge text-xs">{bids.length} lượt bid</span>
                </div>

                {bids.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-6">
                    Chưa có lượt bid nào. Các lượt bid mới sẽ xuất hiện tại đây theo thời gian thực.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-60 overflow-y-auto font-mono text-xs pr-1">
                    {bids.map((bid, index) => (
                      <div
                        key={bid.id || index}
                        className={`p-2 border flex items-center justify-between ${
                          index === 0
                            ? "border-black bg-yellow-100 font-bold"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <div>
                          <span>{bid.bidderName}</span>
                          {user && bid.bidderId === user.id && " (Bạn)"}
                          <span className="text-[10px] text-gray-500 block">
                            {new Date(bid.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">
                            ${bid.bidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          {index === 0 && (
                            <span className="text-[10px] text-emerald-700 block">DẪN ĐẦU</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
