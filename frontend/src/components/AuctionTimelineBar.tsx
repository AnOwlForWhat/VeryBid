"use client";

import React, { useMemo } from "react";

interface AuctionTimelineBarProps {
  selectedDate: string | null; // YYYY-MM-DD or null for all
  onSelectDate: (date: string | null) => void;
  className?: string;
}

interface TimelineDateItem {
  dateString: string; // YYYY-MM-DD
  dayLabel: string;
  dayOfWeekOriginal: string;
  dayNumber: string;
  monthString: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export function AuctionTimelineBar({
  selectedDate,
  onSelectDate,
  className = "",
}: AuctionTimelineBarProps) {
  // Generate a 9-day window centered around today: 4 days past, today, 4 days future
  const timelineDates = useMemo(() => {
    const dates: TimelineDateItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysOfWeekVi = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    for (let offset = -4; offset <= 4; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const isToday = offset === 0;
      const isPast = offset < 0;
      const isFuture = offset > 0;

      // Nhãn trực quan: Hôm nay, Hôm qua, các ngày trước đó và lịch các ngày sắp tới
      let dayLabel = daysOfWeekVi[d.getDay()];
      if (offset === 0) dayLabel = "Hôm nay";
      else if (offset === -1) dayLabel = "Hôm qua";
      else if (offset === -2) dayLabel = "Hôm kia";
      else if (offset === 1) dayLabel = "Ngày mai";
      else if (offset === 2) dayLabel = "Ngày kia";

      dates.push({
        dateString,
        dayLabel,
        dayOfWeekOriginal: daysOfWeekVi[d.getDay()],
        dayNumber: day,
        monthString: `Thg ${d.getMonth() + 1}`,
        isToday,
        isPast,
        isFuture,
      });
    }

    return dates;
  }, []);

  return (
    <div className={`p-4 bg-white border border-[#E5E4DE] rounded-2xl shadow-sm space-y-3 ${className}`}>
      {/* Top Header of the Timeline Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E4DE] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FBF3F0] text-[#D97757] flex items-center justify-center font-bold text-sm border border-[#F5D3C8]">
            📅
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1F1E1D]">Thanh Lịch Trình Ngày Đấu Giá</h3>
            <p className="text-[11px] text-[#6B6A66]">
              Xem Hôm nay, Hôm qua, kết quả các ngày trước đó và lịch trình sắp tới
            </p>
          </div>
        </div>

        {/* Date Filter Quick Reset / Custom Date Picker */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${
              selectedDate === null
                ? "bg-[#1F1E1D] text-white border-[#1F1E1D] shadow-sm"
                : "bg-[#FAF9F5] text-[#6B6A66] border-[#E5E4DE] hover:bg-[#F0EFEA] hover:text-[#1F1E1D]"
            }`}
          >
            Tất Cả Các Ngày
          </button>

          {/* Custom Date Picker Input */}
          <div className="relative flex items-center" title="Chọn ngày bất kỳ trong lịch">
            <input
              type="date"
              value={selectedDate || ""}
              onChange={(e) => onSelectDate(e.target.value ? e.target.value : null)}
              className="text-xs py-1 px-2.5 rounded-lg border border-[#E5E4DE] bg-[#FAF9F5] text-[#1F1E1D] font-medium outline-none focus:border-[#D97757] focus:ring-1 focus:ring-[#D97757]"
            />
          </div>
        </div>
      </div>

      {/* Timeline Date Strip Slider */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
        <div className="flex items-center gap-2 min-w-max">
          {timelineDates.map((item) => {
            const isSelected = selectedDate === item.dateString;

            return (
              <button
                key={item.dateString}
                type="button"
                onClick={() => onSelectDate(item.dateString)}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all min-w-[96px] ${
                  isSelected
                    ? "bg-[#FBF3F0] border-[#D97757] ring-2 ring-[#D97757]/20 shadow-sm"
                    : "bg-[#FAF9F5] border-[#E5E4DE] hover:bg-white hover:border-[#D5D3CC]"
                }`}
              >
                {/* Day Label (Hôm nay / Hôm qua / Ngày mai / Thứ X) */}
                <div className="flex items-center gap-1 mb-1">
                  {item.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                  )}
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider ${
                      item.isToday
                        ? "text-[#16A34A] font-bold"
                        : isSelected
                        ? "text-[#D97757] font-bold"
                        : "text-[#6B6A66]"
                    }`}
                  >
                    {item.dayLabel}
                  </span>
                </div>

                {/* Day Number */}
                <span
                  className={`text-xl font-bold leading-tight ${
                    isSelected
                      ? "text-[#D97757]"
                      : item.isToday
                      ? "text-[#1F1E1D]"
                      : "text-[#1F1E1D]"
                  }`}
                >
                  {item.dayNumber}
                </span>

                {/* Month string */}
                <span className="text-[10px] text-[#9E9D96] font-medium">
                  {item.monthString}
                </span>

                {/* Sub status badge */}
                <div className="mt-1.5 w-full">
                  {item.isPast ? (
                    <span className="block text-[9px] font-medium py-0.5 px-1 rounded bg-[#EAE8E1] text-[#6B6A66] truncate">
                      🏆 Kết quả
                    </span>
                  ) : item.isToday ? (
                    <span className="block text-[9px] font-bold py-0.5 px-1 rounded bg-[#DCFCE7] text-[#166534] truncate">
                      🔴 Hôm nay
                    </span>
                  ) : (
                    <span className="block text-[9px] font-medium py-0.5 px-1 rounded bg-[#FEF3C7] text-[#92400E] truncate">
                      ⏳ Sắp tới
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Summary Label */}
      {selectedDate && (
        <div className="flex items-center justify-between pt-1 text-xs text-[#6B6A66]">
          <div className="flex items-center gap-1.5">
            <span>Đang xem lịch/kết quả ngày:</span>
            <strong className="text-[#1F1E1D] font-mono bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E4DE]">
              {selectedDate}
            </strong>
          </div>
          <button
            type="button"
            onClick={() => onSelectDate(null)}
            className="text-[11px] text-[#D97757] hover:underline font-medium"
          >
            ✕ Bỏ chọn ngày (Xem tất cả)
          </button>
        </div>
      )}
    </div>
  );
}
