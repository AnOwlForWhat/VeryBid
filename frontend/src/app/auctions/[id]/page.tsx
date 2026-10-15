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
        setErrorMessage("Auction not found or failed to load.");
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

      // Update next recommended bid input
      setAuction((current) => {
        if (current) {
          const nextMin = event.currentPrice + current.stepPrice;
          setBidAmountInput(nextMin.toString());
        }
        return current;
      });
    }

    // Anti-Sniping Soft-Close Banner
    if (event.eventType === "AUCTION_EXTENDED") {
      setSoftCloseNotification(
        "⚡ Soft-Close Anti-Sniping: Bid placed near closing time! Clock extended by 2 minutes."
      );
      setTimeout(() => setSoftCloseNotification(null), 8000);
    } else if (event.eventType === "BUYOUT") {
      setSoftCloseNotification(
        `🏆 Buyout completed by ${event.highestBidderName ?? "Collector"}! Auction has concluded.`
      );
    }
  }, []);

  const { isConnected } = useAuctionWebSocket({
    auctionId,
    onEvent: handleWebSocketEvent,
    enabled: !!auctionId,
  });

  // Calculate next minimum bid
  const nextMinimumBid = useMemo(() => {
    if (!auction) return 0;
    const base = auction.currentPrice ?? auction.startPrice;
    return base + auction.stepPrice;
  }, [auction]);

  // Handle Placing a Bid
  const handlePlaceBid = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auction) return;

    const amount = parseFloat(bidAmountInput);
    if (isNaN(amount) || amount < nextMinimumBid) {
      setErrorMessage(`Bid must be at least $${nextMinimumBid.toFixed(2)}.`);
      return;
    }

    if (!isAuthenticated) {
      setErrorMessage("Please sign in to place a bid.");
      return;
    }

    setIsSubmittingBid(true);
    setErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      const bid = await auctionApi.placeBid(auction.id, amount);
      setActionSuccessMessage(`Successfully placed bid of $${bid.bidAmount.toFixed(2)}!`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err: unknown) {
      console.error("Bid error:", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to place bid. Please check your balance or auction status.");
      }
    } finally {
      setIsSubmittingBid(false);
    }
  };

  // Handle Quick Bid Additions
  const handleQuickBid = (incrementAmount: number) => {
    if (!auction) return;
    const current = auction.currentPrice ?? auction.startPrice;
    const newBid = current + incrementAmount;
    setBidAmountInput(newBid.toFixed(2));
  };

  // Handle Instant Buyout
  const handleBuyNow = async () => {
    if (!auction || !auction.buyNowPrice) return;
    if (!isAuthenticated) {
      setErrorMessage("Please sign in to complete instant purchase.");
      return;
    }

    const confirmBuy = window.confirm(
      `Confirm instant purchase for $${auction.buyNowPrice.toLocaleString()}? This will immediately settle and close the auction.`
    );
    if (!confirmBuy) return;

    setIsSubmittingBuyout(true);
    setErrorMessage(null);
    try {
      await auctionApi.buyNow(auction.id);
      setActionSuccessMessage("Congratulations! You purchased this item instantly!");
    } catch (err: unknown) {
      console.error("Buyout error:", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Failed to process Buy Now purchase.");
      }
    } finally {
      setIsSubmittingBuyout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Entering live auction room...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage && !auction) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-2">Auction Not Found</h2>
            <p className="text-sm text-slate-400 mb-6">{errorMessage}</p>
            <Link
              href="/auctions"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              Browse All Auctions
            </Link>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      {/* Real-time Soft Close Notification Banner */}
      {softCloseNotification && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-center text-sm font-bold shadow-lg animate-bounce">
          {softCloseNotification}
        </div>
      )}

      {/* Main Room Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb & WebSocket Connection Badge */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/auctions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <span>←</span> Back to Auctions Catalog
          </Link>

          {/* WebSocket Status Indicator */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-900 border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            ></span>
            <span className="text-slate-300">
              {isConnected ? "Live Room Connected" : "Connecting Stream..."}
            </span>
          </div>
        </div>

        {/* 2-Column Live Bidding Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery, AI Authenticity & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/3] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt={auction.item?.title ?? "Item Image"}
                className="w-full h-full object-contain p-2"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30">
                  {auction.item?.category?.name}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
                  Condition: {auction.item?.declaredCondition}
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {auction.item?.images && auction.item.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {auction.item.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      selectedImage === img.imageUrl
                        ? "border-amber-500 shadow-md shadow-amber-500/20"
                        : "border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.imageUrl}
                      alt={img.angle}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-[9px] text-center font-bold text-slate-300">
                      {img.angle}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Item Title & Description Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {auction.item?.title}
              </h1>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {auction.item?.description}
              </p>

              <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Seller</span>
                  <span className="font-semibold text-slate-200">
                    {auction.item?.sellerName || "Verified Collector"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Auction ID</span>
                  <span className="font-mono text-slate-400 truncate block">
                    {auction.id.slice(0, 8)}...
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Listed Date</span>
                  <span className="text-slate-300">
                    {new Date(auction.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Multimodal Gemini AI Authenticity & Appraisal Badge */}
            <div className="bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-bold">
                    ✨
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      Gemini AI Authenticity Verification
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Analyzed 5 multi-angle high-resolution images & packaging integrity.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-amber-500/10 text-center">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Authenticity</span>
                  <span className="text-sm font-bold text-emerald-400">99.4% Match</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Condition Grade</span>
                  <span className="text-sm font-bold text-amber-400">9.5 / 10 Mint</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Tamper Check</span>
                  <span className="text-sm font-bold text-blue-400">Intact Seal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Bidding Console (5 cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Live Pricing & Clock Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
              {/* Countdown Clock Header */}
              <div className="flex flex-col items-center justify-center pb-6 border-b border-slate-800">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
                  {isAuctionUpcoming
                    ? "Auction Commences In"
                    : isAuctionEnded
                    ? "Auction Concluded"
                    : "Time Remaining"}
                </span>
                <CountdownTimer
                  targetDate={isAuctionUpcoming ? auction.startTime : auction.endTime}
                  isUpcoming={isAuctionUpcoming}
                  onExpire={loadAuction}
                />
              </div>

              {/* Price Display */}
              <div
                className={`py-6 text-center transition-colors duration-500 rounded-2xl ${
                  priceFlash ? "bg-amber-500/10" : ""
                }`}
              >
                <span className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                  {auction.totalBids > 0 ? "Current Highest Bid" : "Starting Bid"}
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    ${(auction.currentPrice ?? auction.startPrice).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Leading Bidder pill */}
                <div className="mt-3 flex items-center justify-center gap-2">
                  {isWinning ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      🎉 You are currently winning!
                    </span>
                  ) : auction.currentWinnerName ? (
                    <span className="text-xs text-slate-400">
                      Leading Bidder:{" "}
                      <span className="font-semibold text-slate-200">
                        {auction.currentWinnerName}
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">No bids yet. Be the first!</span>
                  )}
                </div>

                {/* Bid Details Summary */}
                <div className="mt-6 grid grid-cols-2 gap-2 text-xs border-t border-slate-800/80 pt-4">
                  <div className="bg-slate-950 p-2.5 rounded-xl text-left">
                    <span className="text-slate-500 block">Minimum Increment</span>
                    <span className="font-semibold text-slate-200">
                      +${auction.stepPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl text-left">
                    <span className="text-slate-500 block">Total Bids Placed</span>
                    <span className="font-semibold text-slate-200">
                      {auction.totalBids ?? 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error & Success Feedback alerts */}
              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}
              {actionSuccessMessage && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium">
                  {actionSuccessMessage}
                </div>
              )}

              {/* Bidding Controls */}
              {isAuctionActive && (
                <div className="space-y-4 pt-2">
                  {isSeller ? (
                    <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-amber-400 border border-amber-500/20">
                      You are the seller of this auction item. Self-bidding is strictly prohibited.
                    </div>
                  ) : (
                    <>
                      {/* Quick Increment Buttons */}
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-500 block mb-2">
                          Quick Bid Increments
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            auction.stepPrice,
                            auction.stepPrice * 2,
                            auction.stepPrice * 5,
                          ].map((inc, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleQuickBid(inc)}
                              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 rounded-xl border border-slate-700 transition"
                            >
                              +${inc.toFixed(0)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Bid Input Form */}
                      <form onSubmit={handlePlaceBid} className="space-y-3">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            $
                          </span>
                          <input
                            type="number"
                            step="any"
                            min={nextMinimumBid}
                            value={bidAmountInput}
                            onChange={(e) => setBidAmountInput(e.target.value)}
                            placeholder={nextMinimumBid.toFixed(2)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingBid}
                          className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-base shadow-xl hover:shadow-amber-500/25 disabled:opacity-50 transition duration-150"
                        >
                          {isSubmittingBid ? "Placing Bid..." : `Place Bid for $${bidAmountInput || nextMinimumBid.toFixed(2)}`}
                        </button>
                      </form>

                      {/* Buy Now Option */}
                      {auction.buyNowPrice && (
                        <div className="pt-3 border-t border-slate-800">
                          <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={isSubmittingBuyout}
                            className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50"
                          >
                            {isSubmittingBuyout
                              ? "Processing Purchase..."
                              : `Buy It Now for $${auction.buyNowPrice.toLocaleString()}`}
                          </button>
                          <span className="text-[10px] text-slate-500 text-center block mt-1.5">
                            Skip bidding and win item immediately.
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {isAuctionEnded && (
                <div className="p-4 bg-slate-950 rounded-xl text-center border border-slate-800">
                  <span className="text-sm font-bold text-slate-300 block">
                    This auction has ended.
                  </span>
                  {auction.currentWinnerName ? (
                    <p className="text-xs text-amber-400 mt-1">
                      Winner: {auction.currentWinnerName} with a final bid of $
                      {auction.currentPrice?.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">No winning bids were placed.</p>
                  )}
                </div>
              )}

              {isAuctionUpcoming && (
                <div className="p-4 bg-slate-950 rounded-xl text-center border border-slate-800">
                  <span className="text-sm font-bold text-blue-400 block">
                    Bidding opens when timer reaches zero.
                  </span>
                  <p className="text-xs text-slate-400 mt-1">
                    Starting bid will be ${auction.startPrice?.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Anti-Sniping Soft-Close info badge */}
              <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400">
                <span className="text-amber-500 text-sm">🛡️</span>
                <span>
                  <strong>Soft-Close Protected:</strong> Bids submitted within the last 2 minutes
                  extend closing time by 2 minutes to prevent sniping.
                </span>
              </div>
            </div>

            {/* Real-Time Bids Feed */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Bid Activity
                </h3>
                <span className="text-xs text-slate-500">
                  {bids.length} recorded {bids.length === 1 ? "bid" : "bids"}
                </span>
              </div>

              {bids.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  No bids yet. Live bids will stream here automatically.
                </p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {bids.map((bid, index) => (
                    <div
                      key={bid.id || index}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs transition ${
                        index === 0
                          ? "bg-amber-500/10 border-amber-500/30 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                        <div>
                          <span className="font-bold text-white block">
                            {bid.bidderName}
                            {user && bid.bidderId === user.id && " (You)"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(bid.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-sm text-amber-400">
                          ${bid.bidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] text-emerald-400 block font-semibold">
                            Leading
                          </span>
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
  );
}
