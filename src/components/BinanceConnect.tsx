// https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md
import React from "react";

import { useWebSocket } from "../shared/useWebSocket";
import {
  applyExchangeOrderBookEdits,
  TOrderBook,
  TOrderBookSide,
} from "./OrderBook";

const WS_URL_BINANCE = "wss://stream.binance.com/ws";
const OB_STEP_BINANCE = 0.01;

type TBinanceOrderBookEdit = [string, number]; // price, sizeBTC
type TBinanceOrderbookMessage = {
  e: "depthUpdate";
  E: number; // Event time
  u: number; // Final update ID in event
  a: Array<TBinanceOrderBookEdit>;
  b: Array<TBinanceOrderBookEdit>;
};
type TBinanceTicker = {
  e: "24hrTicker";
  p: number; // Price change
  P: number; // Price change percent
  c: string; // Last price
  Q: number; // Last quantity
  b: number; // Best bid price
  a: number; // Best ask price
};
type TBinanceMessage = TBinanceOrderbookMessage | TBinanceTicker;

export const useBinanceConnect = () => {
  const [orderbook, setOrderbook] = React.useState<TOrderBook | null>(null);
  const [lastPrice, setLastPrice] = React.useState<number | null>(null);
  const { readyState, lastMessage, sendMessage } = useWebSocket<
    TBinanceMessage
  >(WS_URL_BINANCE, {
    onOpen: () => {
      sendMessage(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: ["btcusdt@depth", "btcusdt@ticker"],
          id: 1, // required by binance >.<
        })
      );
    },
    onClose: () => {
      setOrderbook(null);
      setLastPrice(null);
    },
  });

  React.useEffect(() => {
    const oReq = new XMLHttpRequest();
    oReq.addEventListener("load", (e: any) => {
      const data = JSON.parse(e.currentTarget.response);
      const { lastUpdateId, bids, asks } = data;
      setOrderbook(() =>
        applyExchangeOrderBookEdits<TBinanceOrderBookEdit>(
          null,
          convertEdits(asks, bids, lastUpdateId),
          OB_STEP_BINANCE
        )
      );
      // TODO: ...
      // const filtered = new Map();
      // if (obEntries.current != null) {
      //   obEntries.current.forEach((e, price) => {
      //     if (e.id > lastUpdateId) filtered.set(price, e);
      //   });
      //   obEntries.current = filtered;
      // }
      // const tt = { entries: new Map(), bestAsk: 0, bestBid: 0 };
      // applyExchangeOrderBookEdits(tt);
    });
    oReq.open(
      "GET",
      "https://www.binance.com/api/v1/depth?symbol=BTCUSDT&limit=1000"
    );
    oReq.send();
  }, []);

  React.useEffect(() => {
    if (!lastMessage) return;
    switch (lastMessage.e) {
      case "depthUpdate": {
        const { u: lastUpdateId, a: asks, b: bids } = lastMessage;
        setOrderbook((ob) => {
          if (ob == null) return null;
          return applyExchangeOrderBookEdits<TBinanceOrderBookEdit>(
            ob,
            convertEdits(asks, bids, lastUpdateId),
            OB_STEP_BINANCE
          );
        });
        break;
      }
      case "24hrTicker": {
        const lastPrice = parseFloat(lastMessage.c);
        setLastPrice(lastPrice);
        break;
      }
      default: {
        console.log("binance", lastMessage);
      }
    }
  }, [lastMessage]);

  return {
    readyState,
    orderbook, // : { entries: new Map(), bestBid: -1, bestAsk: -1 }
    lastPrice,
  };
};

const mapEditFormat = (id: number) => (edit: TBinanceOrderBookEdit) => {
  const [priceStr, sizeBTC] = edit;
  const price = parseFloat(priceStr) || 0;
  return { id, price, size: Math.round(sizeBTC * price) };
};

const convertEdits = (
  asks: TBinanceOrderBookEdit[],
  bids: TBinanceOrderBookEdit[],
  lastUpdateId: number
) => [
  ...asks.map((edit: TBinanceOrderBookEdit) => ({
    side: TOrderBookSide.ASKS,
    edit: mapEditFormat(lastUpdateId)(edit),
  })),
  ...bids.map((edit: TBinanceOrderBookEdit) => ({
    side: TOrderBookSide.BIDS,
    edit: mapEditFormat(lastUpdateId)(edit),
  })),
];
