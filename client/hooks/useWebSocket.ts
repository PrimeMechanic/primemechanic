import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function getWsUrl(): string {
  const host = process.env.EXPO_PUBLIC_DOMAIN;
  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }
  const protocol = host.includes("localhost") ? "ws" : "wss";
  return `${protocol}://${host}/ws`;
}

interface UseWebSocketOptions {
  userId: string | undefined;
  onMessage?: (data: any) => void;
  enabled?: boolean;
}

export function useWebSocket({ userId, onMessage, enabled = true }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    if (!userId || !enabled) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(getWsUrl());

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({ type: "register", userId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "registered") {
            onMessageRef.current?.(data);
          }
        } catch {}
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (enabled) {
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {}
  }, [userId, enabled]);

  useEffect(() => {
    connect();

    const handleAppState = (state: AppStateStatus) => {
      if (state === "active") {
        connect();
      } else if (state === "background" && wsRef.current) {
        wsRef.current.close();
      }
    };

    const sub = AppState.addEventListener("change", handleAppState);

    return () => {
      sub.remove();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { isConnected };
}
