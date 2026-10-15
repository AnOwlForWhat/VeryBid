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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Now
          </span>
        );
      case "UPCOMING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="h-2 w-2 rounded-full bg-blue-400"></span>
            Upcoming
          </span>
        );
      case "ENDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Ended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Discover <span className="text-amber-500">Live Auctions</span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Bid on verified collectibles with real-time soft-close protection.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by collectible name or brand..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-xl transition duration-150"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters: Status Tabs + Categories */}
        <div className="py-6 space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "ACTIVE", label: "Active Live" },
              { id: "UPCOMING", label: "Upcoming" },
              { id: "ALL", label: "All Auctions" },
              { id: "ENDED", label: "Closed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedStatus(tab.id as AuctionStatus | "ALL");
                  setPage(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedStatus === tab.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategory(null);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === null
                  ? "bg-slate-200 text-slate-950 font-bold"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800/80"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800/80"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Auction Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse space-y-4"
              >
                <div className="aspect-video bg-slate-800 rounded-xl"></div>
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-10 bg-slate-800 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="text-center py-16 bg-slate-900/50 border border-rose-500/20 rounded-2xl p-8">
            <p className="text-rose-400 font-semibold mb-2">Error loading auctions</p>
            <p className="text-sm text-slate-400 mb-6">{errorMessage}</p>
            <button
              onClick={loadAuctions}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-2xl p-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-white mb-1">No Auctions Found</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
              There are currently no auctions matching your selected filters. Try changing category or search terms.
            </p>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedStatus("ALL");
                setSearchKeyword("");
                setPage(0);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg transition"
            >
              Reset Filters
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
                  className="group bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/5"
                >
                  {/* Top Image & Badges */}
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt={auction.item?.title ?? "Auction Item"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {getStatusBadge(auction.status)}
                      </div>
                      {auction.item?.category && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-700/60">
                            {auction.item.category.name}
                          </span>
                        </div>
                      )}
                      {auction.buyNowPrice && auction.status === "ACTIVE" && (
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                            Buy Now ${auction.buyNowPrice.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-amber-400 border border-slate-700">
                          {auction.item?.declaredCondition ?? "Inspected"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {auction.totalBids ?? 0} {auction.totalBids === 1 ? "bid" : "bids"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-amber-400 transition">
                        {auction.item?.title}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {auction.item?.description}
                      </p>

                      {/* Pricing & Countdown */}
                      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 items-end">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                            Current Bid
                          </span>
                          <span className="text-xl font-extrabold text-white">
                            ${auction.currentPrice?.toLocaleString() ?? auction.startPrice?.toLocaleString()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 block">
                            {auction.status === "UPCOMING" ? "Starts In" : "Time Left"}
                          </span>
                          <CountdownTimer
                            targetDate={auction.status === "UPCOMING" ? auction.startTime : auction.endTime}
                            isUpcoming={auction.status === "UPCOMING"}
                            compact
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Button */}
                  <div className="p-5 pt-0">
                    <Link
                      href={`/auctions/${auction.id}`}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition duration-150"
                    >
                      {auction.status === "ACTIVE" ? "Enter Live Bidding" : "View Auction Details"}
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-400">
              Page <span className="font-bold text-white">{page + 1}</span> of{" "}
              <span className="font-bold text-white">{pagination.totalPages}</span>
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(pagination.totalPages - 1, prev + 1))}
              disabled={page >= pagination.totalPages - 1}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-medium text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
