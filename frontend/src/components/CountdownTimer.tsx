"use client";

import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
  isUpcoming?: boolean;
  onExpire?: () => void;
  compact?: boolean;
  className?: string;
}

export function CountdownTimer({
  targetDate,
  isUpcoming = false,
  onExpire,
  compact = false,
  className = "",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: diff });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.totalMs <= 0) {
    return (
      <span className={`font-semibold text-xs px-2 py-0.5 rounded bg-[#F0EFEA] text-[#6B6A66] ${className}`}>
        {isUpcoming ? "Sắp mở phiên" : "Đã kết thúc"}
      </span>
    );
  }

  const isUrgent = !isUpcoming && timeLeft.totalMs < 5 * 60 * 1000; // < 5 minutes

  if (compact) {
    const parts = [];
    if (timeLeft.days > 0) parts.push(`${timeLeft.days}d`);
    parts.push(
      `${String(timeLeft.hours).padStart(2, "0")}h`,
      `${String(timeLeft.minutes).padStart(2, "0")}m`,
      `${String(timeLeft.seconds).padStart(2, "0")}s`
    );

    return (
      <span
        className={`font-mono text-xs font-semibold ${
          isUrgent ? "text-[#DC2626] animate-pulse" : "text-[#1F1E1D]"
        } ${className}`}
      >
        ⏱️ {parts.join(" ")}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 font-mono ${className}`}>
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-white border border-[#E5E4DE] rounded-lg px-2 py-1 min-w-[42px] shadow-sm">
          <span className="text-lg font-bold text-[#1F1E1D] leading-tight">{timeLeft.days}</span>
          <span className="text-[9px] text-[#6B6A66] uppercase font-semibold">Ngày</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-white border border-[#E5E4DE] rounded-lg px-2 py-1 min-w-[42px] shadow-sm">
        <span className="text-lg font-bold text-[#1F1E1D] leading-tight">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-[9px] text-[#6B6A66] uppercase font-semibold">Giờ</span>
      </div>
      <span className="text-[#9E9D96] font-bold">:</span>
      <div className="flex flex-col items-center bg-white border border-[#E5E4DE] rounded-lg px-2 py-1 min-w-[42px] shadow-sm">
        <span className="text-lg font-bold text-[#1F1E1D] leading-tight">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-[9px] text-[#6B6A66] uppercase font-semibold">Phút</span>
      </div>
      <span className="text-[#9E9D96] font-bold">:</span>
      <div
        className={`flex flex-col items-center border rounded-lg px-2 py-1 min-w-[42px] shadow-sm ${
          isUrgent ? "bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]" : "bg-white border-[#E5E4DE] text-[#1F1E1D]"
        }`}
      >
        <span className={`text-lg font-bold leading-tight ${isUrgent ? "animate-pulse text-[#DC2626]" : "text-[#1F1E1D]"}`}>
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className={`text-[9px] uppercase font-semibold ${isUrgent ? "text-[#DC2626]" : "text-[#6B6A66]"}`}>
          Giây
        </span>
      </div>
    </div>
  );
}
