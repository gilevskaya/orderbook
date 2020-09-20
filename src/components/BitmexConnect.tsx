import React from "react";
import Recoil from "recoil";
import useWebSocket from "react-use-websocket";

import { TOrderBook, TConnectStatus } from "./OrderBook";

const WS_URL_BITMEX =
  "wss://www.bitmex.com/realtime?subscribe=orderBookL2_25:XBTUSD";

type TBitmexOrderBookMessage =
  | {
      action: "partial";
      data: Array<{
        id: number;
        price: number;
        side: "Sell" | "Buy";
        size: number;
      }>;
    }
  | {
      action: "update";
      data: Array<{
        id: number;
        price: number;
        side: "Sell" | "Buy";
        size: number;
      }>;
    }
  | {
      action: "insert";
      data: Array<{
        id: number;
        price: number;
        side: "Sell" | "Buy";
        size: number;
      }>;
    }
  | {
      action: "delete";
      data: Array<{
        id: number;
        side: "Sell" | "Buy";
      }>;
    };

export const bitmexOrderBook = Recoil.atom<TOrderBook | null>({
  key: "bitmexOrderBook",
  default: null,
});

export const bitmexConnectStatus = Recoil.atom<TConnectStatus | -1>({
  key: "bitmexConnectStatus",
  default: -1,
});

export const BitmexConnect = () => {
  const setReadyState = Recoil.useSetRecoilState(bitmexConnectStatus);
  const [orderBook, setOrderBook] = Recoil.useRecoilState(bitmexOrderBook);

  const { lastMessage, readyState } = useWebSocket(WS_URL_BITMEX, {
    shouldReconnect: (_: CloseEvent) => true,
    reconnectAttempts: 1000,
    reconnectInterval: 1200,
    share: false,
    retryOnError: true,
  });

  React.useEffect(() => {
    setReadyState(readyState);
  }, [readyState, setReadyState]);

  React.useEffect(() => {
    if (!lastMessage || !lastMessage.data) return;
    const message: TBitmexOrderBookMessage = JSON.parse(lastMessage.data);

    switch (message.action) {
      case "partial": {
        if (orderBook != null) return;
        const ob = { asks: new Map(), bids: new Map() };
        message.data.forEach(({ id, price, side, size }) => {
          ob[side === "Sell" ? "asks" : "bids"].set(id, { price, size });
        });
        setOrderBook(ob);
        break;
      }

      case "update": {
        if (orderBook == null) return;
        const ob = {
          asks: new Map(orderBook.asks),
          bids: new Map(orderBook.bids),
        };
        message.data.forEach(({ id, side, size }) => {
          const s = side === "Sell" ? "asks" : "bids";
          const prev = ob[s].get(id);

          if (prev) {
            ob[s].set(id, { size, price: prev.price });
          } else {
            // updated moves the side
            const opS = side === "Sell" ? "bids" : "asks";
            const prevOpS = ob[opS].get(id);
            if (!prevOpS) {
              console.log("!! INS Can't find id in both sides");
              return;
            }
            ob[s].delete(id);
            ob[opS].set(id, { size, price: prevOpS.price });
          }
        });
        setOrderBook(ob);
        break;
      }

      case "insert": {
        if (orderBook == null) return;
        const ob = {
          asks: new Map(orderBook.asks),
          bids: new Map(orderBook.bids),
        };
        message.data.forEach(({ id, side, size, price }) => {
          const s = side === "Sell" ? "asks" : "bids";
          ob[s].set(id, { size, price });
        });
        setOrderBook(ob);
        break;
      }

      case "delete": {
        if (orderBook == null) return;
        const ob = {
          asks: new Map(orderBook.asks),
          bids: new Map(orderBook.bids),
        };
        message.data.forEach(({ id, side }) => {
          const s = side === "Sell" ? "asks" : "bids";
          if (!ob[s].get(id)) {
            console.log(
              "!! DEL Can't find an id, shoud not happen.",
              ob.asks.get(id),
              ob.bids.get(id)
            );
            return;
          }
          ob[s].delete(id);
        });
        setOrderBook(ob);
        break;
      }

      default: {
        console.log("bmex ------", message);
      }
    }
  }, [lastMessage, orderBook, setOrderBook]);

  return null;
};
