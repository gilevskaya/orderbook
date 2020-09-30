import React from "react";

export type TConnectStatus =
  | WebSocket["CONNECTING"]
  | WebSocket["OPEN"]
  | WebSocket["CLOSING"]
  | WebSocket["CLOSED"];

export const connectStatusName = (status: TConnectStatus | -1): string => {
  if (status === -1) return "Uninitiated";
  return {
    [WebSocket.CONNECTING]: "Connecting",
    [WebSocket.OPEN]: "Open",
    [WebSocket.CLOSING]: "Closing",
    [WebSocket.CLOSED]: "Closed",
  }[status];
};

export type WebSocketMessage =
  | string
  | ArrayBuffer
  | SharedArrayBuffer
  | Blob
  | ArrayBufferView;
export type SendMessage = (message: WebSocketMessage) => void;

export function useWebSocket<T>(url: string) {
  const ws = React.useRef<WebSocket | null>(null);
  const messageQueue = React.useRef<WebSocketMessage[]>([]);
  const [lastMessage, setLastMessage] = React.useState<T | null>(null);

  const sendMessage: SendMessage = React.useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else messageQueue.current.push(message);
  }, []);

  const connect = React.useCallback((): WebSocket => {
    const newws = new WebSocket(url);
    newws.onopen = (e) => {
      /*...*/
    };
    newws.onclose = (e) => {
      console.log("ws closed", e);
      ws.current = null;
      messageQueue.current = [];
      ws.current = connect();
    };
    newws.onerror = (e) => {
      console.warn("ws error", e);
    };
    newws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      setLastMessage(msg);
    };
    return newws;
  }, [url]);

  React.useEffect(() => {
    if (ws.current == null || ws.current.readyState === WebSocket.CLOSED) {
      ws.current = connect();
    } else if (ws.current.readyState === WebSocket.OPEN) {
      messageQueue.current.splice(0).forEach((message) => {
        sendMessage(message);
      });
    }
  }, [ws, connect, sendMessage]);

  return {
    readyState: ws.current ? ws.current.readyState : -1,
    lastMessage,
    sendMessage,
  };
}
