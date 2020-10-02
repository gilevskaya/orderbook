import React from "react";

import { TOrderBook, TOrderBookEntry, TOrderBookSide } from "./OrderBook";
import { TExchangeContext } from "../shared/types";

const WS_URL_DERIBIT = "wss://www.deribit.com/ws/api/v2";

type TDeribitOrderBookEdit = ["new" | "change", number, number];
type TDeribitOrderBookMessage = {
  asks: Array<TDeribitOrderBookEdit>; // type, price, size
  bids: Array<TDeribitOrderBookEdit>;
  timestamp: number;
};
type TDeribitTickerMessage = {
  last_price: number;
};
type TDeribitMessage = TDeribitOrderBookMessage | TDeribitTickerMessage;
export const DeribitContext = React.createContext<TExchangeContext>({
  connectStatus: -1,
  orderbook: null,
  lastPrice: null,
});

export const DeribitConnect = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren;
}) => {
  const [readyState, setReadyState] = React.useState(-1);
  const [orderbook, setOrderbook] = React.useState<TOrderBook | null>(null);
  const [lastPrice, setLastPrice] = React.useState<number | null>(null);

  const obEntries = React.useRef<Map<number, TOrderBookEntry>>(new Map());
  const obBestBid = React.useRef<number | null>(null);
  const obBestAsk = React.useRef<number | null>(null);

  React.useEffect(() => {
    const msg = {
      jsonrpc: "2.0",
      id: 3600,
      method: "public/subscribe",
      params: {
        channels: [
          "book.BTC-PERPETUAL.raw",
          "trades.BTC-PERPETUAL.raw",
          "ticker.BTC-PERPETUAL.raw",
        ],
      },
    };
    const ws = new WebSocket(WS_URL_DERIBIT);

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (!message.params || !message.params.data) return;
      const { channel } = message.params;

      if (channel.startsWith("book.BTC-PERPETUAL")) {
        const data: TDeribitOrderBookMessage = message.params.data;

        const deribitEdits: Array<{
          side: TOrderBookSide;
          edit: TDeribitOrderBookEdit;
        }> = [
          ...data.asks.map((edit) => ({ side: TOrderBookSide.ASKS, edit })),
          ...data.bids.map((edit) => ({ side: TOrderBookSide.BIDS, edit })),
        ];

        for (const editEntry of deribitEdits) {
          const { side, edit } = editEntry;
          const [type, price, size] = edit;

          if (type === "new") {
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
            obEntries.current.set(price, {
              side,
              price,
              size,
              total: 0,
              timestamp: data.timestamp,
            });
            // end of "new"
          } else if (type === "change") {
            obEntries.current.set(price, {
              side,
              price,
              size,
              total: 0,
              timestamp: data.timestamp,
            });
            // end of "change"
          } else if (type === "delete") {
            if (side === "asks" && price === obBestAsk.current) {
              obBestAsk.current = price + 0.5;
            } else if (side === "bids" && price === obBestBid.current) {
              obBestBid.current = price - 0.5;
            }
            obEntries.current.delete(price);
          }
        }

        if (obBestBid.current == null || obBestAsk.current == null) return;
        setOrderbook({
          entries: obEntries.current,
          bestBid: obBestBid.current,
          bestAsk: obBestAsk.current,
        });
      } else if (channel.startsWith("ticker.BTC-PERPETUAL")) {
        const data: TDeribitTickerMessage = message.params.data;
        setLastPrice(data.last_price);

        // TODO: Trades feed...
      } else if (channel.startsWith("trades.BTC-PERPETUAL")) {
        // const data: TTrade[] = message.params.data;
      } else console.log("deribit unknown msg:", message);
    };
    ws.onopen = () => {
      setReadyState(WebSocket.OPEN);
      ws.send(JSON.stringify(msg));
    };
    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
    };
  }, []);

  return (
    <DeribitContext.Provider
      value={{
        connectStatus: readyState,
        orderbook,
        lastPrice,
      }}
    >
      {children}
    </DeribitContext.Provider>
  );
};
