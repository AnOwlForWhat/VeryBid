"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { BidEvent } from "@/types/auction";

interface UseAuctionWebSocketOptions {
  auctionId: string | null | undefined;
  onEvent?: (event: BidEvent) => void;
  enabled?: boolean;
}

export function useAuctionWebSocket({
  auctionId,
  onEvent,
  enabled = true,
}: UseAuctionWebSocketOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<BidEvent | null>(null);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  const handleMessage = useCallback((message: IMessage) => {
    try {
      const payload: BidEvent = JSON.parse(message.body);
      setLastEvent(payload);
      if (onEventRef.current) {
        onEventRef.current(payload);
      }
    } catch (err) {
      console.error("Failed to parse STOMP message payload:", err);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !auctionId || typeof window === "undefined") {
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ??
      (apiUrl.startsWith("https")
        ? apiUrl.replace("https://", "wss://")
        : apiUrl.replace("http://", "ws://")) + "/ws";

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[STOMP]", str);
        }
      },
      onConnect: () => {
        setIsConnected(true);
        const destination = `/topic/auctions/${auctionId}`;
        const sub = client.subscribe(destination, handleMessage);
        subscriptionRef.current = sub;
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP Broker error: " + frame.headers["message"], frame.body);
      },
      onWebSocketClose: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
    };
  }, [auctionId, enabled, handleMessage]);

  return {
    isConnected,
    lastEvent,
  };
}
