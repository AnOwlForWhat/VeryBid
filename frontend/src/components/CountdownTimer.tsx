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
      <span className={`font-bold text-neutral-600 ${className}`}>
        {isUpcoming ? "[SẮP MỞ PHIÊN]" : "[ĐÃ ĐÓNG PHIÊN]"}
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
        className={`font-mono font-bold ${
          isUrgent ? "text-red-600 animate-pulse" : "text-black"
        } ${className}`}
      >
        {parts.join(" ")}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 font-mono ${className}`}>
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-white border-2 border-black px-2 py-0.5 min-w-[44px]">
          <span className="text-xl font-black text-black leading-tight">{timeLeft.days}</span>
          <span className="text-[10px] text-neutral-600 uppercase font-bold">Ngày</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-white border-2 border-black px-2 py-0.5 min-w-[44px]">
        <span className="text-xl font-black text-black leading-tight">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-neutral-600 uppercase font-bold">Giờ</span>
      </div>
      <span className="text-black font-black">:</span>
      <div className="flex flex-col items-center bg-white border-2 border-black px-2 py-0.5 min-w-[44px]">
        <span className="text-xl font-black text-black leading-tight">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-neutral-600 uppercase font-bold">Phút</span>
      </div>
      <span className="text-black font-black">:</span>
      <div
        className={`flex flex-col items-center border-2 border-black px-2 py-0.5 min-w-[44px] ${
          isUrgent ? "bg-[#fef2f2] text-red-600" : "bg-white text-black"
        }`}
      >
        <span className={`text-xl font-black leading-tight ${isUrgent ? "animate-pulse text-red-600" : "text-black"}`}>
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-neutral-600 uppercase font-bold">Giây</span>
      </div>
    </div>
  );
}
