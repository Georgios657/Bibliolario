import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { API } from "../api";

// 👉 Typ für Context
type WebSocketContextType = {
  clientRef: React.MutableRefObject<Client | null>;
  connected: boolean;
};

// 👉 Context erstellen
const WebSocketContext = createContext<WebSocketContextType | null>(null);


// 👉 Provider
export const WebSocketProvider: React.FC<{
  children: React.ReactNode;
  isLoggedIn: boolean;
}> = ({ children, isLoggedIn }) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // ✅ WebSocket URL dynamisch generieren
    const getWebSocketUrl = () => {
      // ✅ WICHTIG: Backend-URL verwenden, nicht Frontend-URL!
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      const host = window.location.hostname;
      const port = window.location.protocol === 'https:' ? '' : ':8080';
      
      return `${protocol}//${host}${port}/ws`;
    };

    const client = new Client({
      webSocketFactory: () => new SockJS(getWebSocketUrl()),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("🌐 connected to", getWebSocketUrl());
        setConnected(true);
      },
      onDisconnect: () => {
        setConnected(false);
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
      setConnected(false);
    };
  }, [isLoggedIn]);

  return (
    <WebSocketContext.Provider value={{ clientRef, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

// 👉 Hook
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};