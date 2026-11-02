"use client";

import React from "react";
import Link from "next/link";
import { Auction } from "@/types/auction";

interface HistoricalAuctionResultCardProps {
  auction: Auction;
}

/**
 * Ẩn danh một phần tên/email người trúng đấu giá để bảo vệ quyền riêng tư & bảo mật
 * Ví dụ: bidder@verybid.com -> bi***r@verybid.com, Nguyen Van A -> N***n V*n A
 */
function maskWinnerName(name?: string | null): string {
  if (!name || name.trim() === "") return "Chưa có người trúng";
  const trimmed = name.trim();

  if (trimmed.includes("@")) {
    const [user, domain] = trimmed.split("@");
    if (user.length <= 2) {
      return `${user[0]}***@${domain}`;
    }
    return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
  }

  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    const w = words[0];
    if (w.length <= 2) return w[0] + "***";
    return `${w.slice(0, 2)}***${w.slice(-1)}`;
  }

  return words
    .map((w) => {
      if (w.length <= 2) return w[0] + "*";
      return `${w[0]}***${w.slice(-1)}`;
    })
    .join(" ");
}

export function HistoricalAuctionResultCard({ auction }: HistoricalAuctionResultCardProps) {
  const thumbnail =
    auction.item?.images?.find((img) => img.isThumbnail)?.imageUrl ||
    auction.item?.images?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80";

  const startPrice = auction.startPrice || 0;
  const finalPrice = auction.currentPrice || auction.startPrice || 0;
  const priceDiff = finalPrice - startPrice;
  const percentageGain = startPrice > 0 ? ((priceDiff / startPrice) * 100).toFixed(1) : "0.0";

  // Format closed date
  const formatClosedDate = (dateStr?: string) => {
    if (!dateStr) return "Đã hoàn tất";
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} ngày ${d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`;
    } catch {
      return dateStr;
    }
  };

  const hasWinner = Boolean(auction.currentWinnerName || auction.currentWinnerId);

  return (
    <div className="claude-card flex flex-col justify-between overflow-hidden group border-[#E5E4DE] hover:border-[#D5D3CC]">
      <div>
        {/* Top Image Box */}
        <div className="relative aspect-[4/3] bg-[#F5F5F0] overflow-hidden border-b border-[#E5E4DE]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt={auction.item?.title ?? "Vật phẩm đấu giá"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Closed Result Badges - Yêu cầu nhãn 'ĐÃ BÁN / KẾT THÚC' */}
          <div className="absolute top-2.5 left-2.5">
            <span className="claude-badge bg-[#1F1E1D] text-white border-0 text-[11px] font-bold shadow-sm tracking-wide">
              ✓ ĐÃ BÁN / KẾT THÚC
            </span>
          </div>

          {auction.item?.category && (
            <div className="absolute top-2.5 right-2.5">
              <span className="claude-badge bg-white/90 backdrop-blur-sm text-[10px] text-[#1F1E1D] font-semibold shadow-sm border border-[#E5E4DE]">
                {auction.item.category.name}
              </span>
            </div>
          )}

          {/* AI Trust Score */}
          {auction.item?.aiReport && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="claude-badge bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shadow-sm">
                🛡️ {auction.item.aiReport.trustScore}/100 AI VERIFIED
              </span>
            </div>
          )}

          {/* Total bids count badge */}
          <div className="absolute bottom-2.5 right-2.5">
            <span className="claude-badge bg-white/95 text-[#1F1E1D] border border-[#E5E4DE] text-[10px] font-semibold shadow-sm">
              {auction.totalBids ?? 0} lượt trả giá
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#6B6A66] mb-1.5">
            <span className="font-medium px-2 py-0.5 rounded bg-[#F0EFEA] text-[11px]">
              {auction.item?.declaredCondition ?? "Đã kiểm định"}
            </span>
            <span className="text-[11px] text-[#9E9D96]">
              Chốt: {formatClosedDate(auction.endTime)}
            </span>
          </div>

          <h3 className="text-base font-bold text-[#1F1E1D] line-clamp-1 group-hover:text-[#D97757] transition-colors">
            <Link href={`/auctions/${auction.id}`}>{auction.item?.title}</Link>
          </h3>

          <p className="text-xs text-[#6B6A66] line-clamp-2 mt-1 leading-relaxed">
            {auction.item?.description}
          </p>

          {/* Winner Profile Strip - Ẩn danh một phần để bảo mật */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">🏆</span>
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#166534] block">
                  Người Trúng Đấu Giá (Đã ẩn danh bảo mật)
                </span>
                <strong className="text-xs text-[#166534] truncate max-w-[170px] block font-mono">
                  {hasWinner ? maskWinnerName(auction.currentWinnerName) : "Chưa có người trúng"}
                </strong>
              </div>
            </div>
            {hasWinner && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                Trúng Giá
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Price Result Metrics & Action Footer */}
      <div className="p-4 sm:p-5 pt-3 border-t border-[#E5E4DE] bg-[#FAF9F5] space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] text-[#6B6A66] font-medium">
              Khởi điểm: ${startPrice.toLocaleString()}
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#1F1E1D] mt-0.5">
              Giá Gõ Búa Cuối Cùng
            </div>
            <div className="text-2xl font-black text-[#1F1E1D]">
              ${finalPrice.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            {priceDiff > 0 ? (
              <div className="inline-flex flex-col items-end">
                <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] px-2 py-0.5 rounded-md border border-[#BBF7D0]">
                  +{priceDiff.toLocaleString()} USD
                </span>
                <span className="text-[10px] text-[#166534] font-semibold mt-0.5">
                  Tăng {percentageGain}% so với khởi điểm
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#6B6A66] font-medium">Giá chốt sàn</span>
            )}
          </div>
        </div>

        {/* Action button */}
        <Link
          href={`/auctions/${auction.id}`}
          className="w-full claude-btn claude-btn-secondary text-xs py-2 font-semibold text-center block"
        >
          📜 Xem Nhật Ký Trả Giá & Chi Tiết →
        </Link>
      </div>
    </div>
  );
}
