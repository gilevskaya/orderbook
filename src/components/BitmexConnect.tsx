import React from "react";

import { useWebSocket } from "../shared/useWebSocket";
import {
  applyExchangeOrderBookEdits,
  TOrderBook,
  TOrderBookSide,
} from "./OrderBook";

const WS_URL_BITMEX =
  "wss://www.bitmex.com/realtime?subscribe=orderBookL2:XBTUSD,trade:XBTUSD";

type TBitmexSide = "Sell" | "Buy";
type TBitmexOrderBookEdit_Base = { id: number; side: TBitmexSide };
type TBitmexOrderBookEdit = TBitmexOrderBookEdit_Base & {
  price: number;
  size: number;
  timestamp: number;
};
type TBitmexOrderbookEditMessage = { table: "orderBookL2" } & (
  | { action: "partial"; data: TBitmexOrderBookEdit[] }
  | { action: "update"; data: TBitmexOrderBookEdit[] }
  | { action: "insert"; data: TBitmexOrderBookEdit[] }
  | { action: "delete"; data: TBitmexOrderBookEdit_Base[] }
);
type TBitmexTradeTickDirection =
  | "MinusTick"
  | "ZeroMinusTick"
  | "PlusTick"
  | "ZeroPlusTick";
type TBitmexTradeMessage = {
  table: "trade";
  data: Array<{
    side: TBitmexSide;
    price: number;
    size: number;
    timestamp: number;
    tickDirection: TBitmexTradeTickDirection;
  }>;
};
type TBitmexMessage = TBitmexOrderbookEditMessage | TBitmexTradeMessage;

export const useBitmexConnect = () => {
  const [orderbook, setOrderbook] = React.useState<TOrderBook | null>(null);
  const [lastPrice, setLastPrice] = React.useState<number | null>(null);
  const obBitmexId = React.useRef<Map<number, number>>(new Map());
  const { readyState, lastMessage } = useWebSocket<TBitmexMessage>(
    WS_URL_BITMEX,
    {
      onClose: () => {
        setOrderbook(null);
        setLastPrice(null);
        obBitmexId.current = new Map();
      },
    }
  );

  React.useEffect(() => {
    if (!lastMessage) return;
    switch (lastMessage.table) {
      case "orderBookL2": {
        if (
          lastMessage.action === "partial" ||
          lastMessage.action === "insert"
        ) {
          const edits = lastMessage.data.map(({ id, side, size, price }) => {
            obBitmexId.current.set(id, price);
            return {
              side: side === "Buy" ? TOrderBookSide.BIDS : TOrderBookSide.ASKS,
              edit: { id, size, price },
            };
          });
          setOrderbook((ob) =>
            applyExchangeOrderBookEdits<TBitmexOrderBookEdit>(
              lastMessage.action === "partial" ? null : ob,
              edits
            )
          );
        } else if (
          lastMessage.action === "update" ||
          lastMessage.action === "delete"
        ) {
          // @ts-ignore
          const edits = lastMessage.data.map((edit) => {
            const { id, side } = edit;
            const price = obBitmexId.current.get(id) || 0; // >.<
            const size = lastMessage.action === "update" ? edit.size : 0;
            return {
              side: side === "Buy" ? TOrderBookSide.BIDS : TOrderBookSide.ASKS,
              edit: { id, size, price },
            };
          });
          setOrderbook((ob) =>
            applyExchangeOrderBookEdits<TBitmexOrderBookEdit>(ob, edits)
          );
        }
        break;
      }
      case "trade": {
        lastMessage.data.forEach((d) => setLastPrice(d.price));
        break;
      }
      default: {
        console.log("bitmex", lastMessage);
      }
    }
  }, [lastMessage]);

  return { readyState, orderbook, lastPrice };
};
