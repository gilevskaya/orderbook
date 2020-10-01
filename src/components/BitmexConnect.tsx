import React from "react";

import { useWebSocket } from "../shared/useWebSocket";
import { TOrderBook, TOrderBookEntry, TOrderBookSide } from "./OrderBook";
import { TExchangeContext } from "../shared/types";

const WS_URL_BITMEX =
  "wss://www.bitmex.com/realtime?subscribe=orderBookL2:XBTUSD,trade:XBTUSD";
type TBitmexSide = "Sell" | "Buy";
type TBitmexOrderBookEditData_Base = { id: number; side: TBitmexSide };
type TBitmexOrderBookEditData = TBitmexOrderBookEditData_Base & {
  price: number;
  size: number;
  timestamp: number;
};
type TBitmexOrderBookEdit = { table: "orderBookL2" } & (
  | { action: "partial"; data: TBitmexOrderBookEditData[] }
  | { action: "update"; data: TBitmexOrderBookEditData[] }
  | { action: "insert"; data: TBitmexOrderBookEditData[] }
  | { action: "delete"; data: TBitmexOrderBookEditData_Base[] }
);
type TBitmexTradeTickDirection =
  | "MinusTick"
  | "ZeroMinusTick"
  | "PlusTick"
  | "ZeroPlusTick";
type TBitmexTrade = {
  table: "trade";
  data: Array<{
    side: TBitmexSide;
    price: number;
    size: number;
    timestamp: number;
    tickDirection: TBitmexTradeTickDirection;
  }>;
};
type TBitmexMessage = TBitmexOrderBookEdit | TBitmexTrade;

export const BitmexContext = React.createContext<TExchangeContext>({
  connectStatus: -1,
  orderbook: null,
  lastPrice: null,
});

export const BitmexConnect = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren;
}) => {
  const { readyState, lastMessage } = useWebSocket<TBitmexMessage>(
    WS_URL_BITMEX
  );
  const [orderbook, setOrderbook] = React.useState<TOrderBook | null>(null);
  const [lastPrice, setLastPrice] = React.useState<number | null>(null);

  const obBitmexId = React.useRef<Map<number, number>>(new Map());
  const obEntries = React.useRef<Map<number, TOrderBookEntry> | null>(null);
  const obBestBid = React.useRef<number | null>(null);
  const obBestAsk = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.table === "trade") {
      lastMessage.data.forEach((d) => setLastPrice(d.price));
    } else if (lastMessage.table === "orderBookL2") {
      switch (lastMessage.action) {
        case "partial":
        case "insert": {
          if (lastMessage.action === "partial") obEntries.current = new Map();
          lastMessage.data.forEach(({ price, size, side: bitmexSide, id }) => {
            const side =
              bitmexSide === "Buy" ? TOrderBookSide.BIDS : TOrderBookSide.ASKS;
            if (
              side === TOrderBookSide.BIDS &&
              (obBestBid.current == null || price > obBestBid.current)
            ) {
              obBestBid.current = price;
            } else if (
              side === TOrderBookSide.ASKS &&
              (obBestAsk.current == null || price < obBestAsk.current)
            ) {
              obBestAsk.current = price;
            }
            obBitmexId.current.set(id, price);
            // @ts-ignore
            obEntries.current.set(price, {
              side,
              price,
              size,
              timestamp: id,
              total: 0,
            });
          });
          break;
        }

        case "update": {
          if (obEntries.current == null) return;
          lastMessage.data.forEach(({ size, side: bitmexSide, id }) => {
            const price = obBitmexId.current.get(id);
            if (price == null) {
              console.warn(`Bitmex: can't change entry: ${id}!`);
              return;
            }
            const side =
              bitmexSide === "Buy" ? TOrderBookSide.BIDS : TOrderBookSide.ASKS;
            // @ts-ignore
            obEntries.current.set(price, {
              side,
              price,
              size,
              timestamp: id,
              total: 0,
            });
          });
          break;
        }

        case "delete": {
          if (obEntries.current == null) return;
          lastMessage.data.forEach(({ side: bitmexSide, id }) => {
            const price = obBitmexId.current.get(id);
            if (price == null) {
              console.warn(`Bitmex: can't delete entry: ${id}!`);
              return;
            }
            const side =
              bitmexSide === "Buy" ? TOrderBookSide.BIDS : TOrderBookSide.ASKS;
            obBitmexId.current.delete(id);
            // @ts-ignore
            obEntries.current.delete(price);
            if (side === "asks" && price === obBestAsk.current) {
              obBestAsk.current = price + 0.5;
            } else if (side === "bids" && price === obBestBid.current) {
              obBestBid.current = price - 0.5;
            }
          });
          break;
        }

        default: {
          console.log("bmex ------", lastMessage);
        }
      }
      if (
        obEntries.current == null ||
        obBestBid.current == null ||
        obBestAsk.current == null
      )
        return;
      setOrderbook({
        entries: obEntries.current,
        bestBid: obBestBid.current,
        bestAsk: obBestAsk.current,
      });
    }
  }, [lastMessage]);

  return (
    <BitmexContext.Provider
      value={{
        connectStatus: readyState,
        orderbook,
        lastPrice,
      }}
    >
      {children}
    </BitmexContext.Provider>
  );
};
