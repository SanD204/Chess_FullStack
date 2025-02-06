import { useEffect, useState } from "react";

const WS_URL = "wss://chess-87uv.onrender.com";
// const WS_URL = "ws://localhost:8000";

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(WS_URL);
      ws.onopen = () => {
        console.log("WebSocket connection established.");
        setSocket(ws);
      };
      ws.onclose = () => {
        console.log("WebSocket connection closed.");
        setTimeout(() => {
          connect(); // Reconnect after 1 second
        }, 1000);
      };
      ws.onerror = (error) => {
        console.error("WebSocket error: ", error);
        ws.close();
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return socket;
};
