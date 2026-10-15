"use client";

import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: string;
  isUpcoming?: boolean;
  onExpire?: () => void;
  compact?: boolean;
}

export function CountdownTimer({
  targetDate,
  isUpcoming = false,
  onExpire,
  compact = false,
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
      <span className="text-slate-400 font-medium">
        {isUpcoming ? "Starting soon..." : "Auction Closed"}
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
        className={`font-mono font-semibold ${
          isUrgent ? "text-rose-400 animate-pulse" : "text-amber-400"
        }`}
      >
        {parts.join(" ")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 min-w-[50px]">
          <span className="text-xl font-bold text-white">{timeLeft.days}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Days</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 min-w-[50px]">
        <span className="text-xl font-bold text-white">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Hours</span>
      </div>
      <span className="text-slate-500 font-bold">:</span>
      <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 min-w-[50px]">
        <span className="text-xl font-bold text-white">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Mins</span>
      </div>
      <span className="text-slate-500 font-bold">:</span>
      <div
        className={`flex flex-col items-center bg-slate-900 border rounded-lg px-2.5 py-1 min-w-[50px] ${
          isUrgent ? "border-rose-500 bg-rose-500/10 text-rose-400" : "border-slate-800 text-white"
        }`}
      >
        <span className={`text-xl font-bold ${isUrgent ? "text-rose-400 animate-pulse" : "text-white"}`}>
          {String(timeLeft.seconds).padStart(2, "0")}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Secs</span>
      </div>
    </div>
  );
}
