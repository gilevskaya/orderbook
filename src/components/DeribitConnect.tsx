import React from "react";

import {
  TOrderBook,
  TOrderBookEntry,
  TSide,
  // TTrade, TODO: For trades feed...
  TConnectStatus,
} from "./OrderBook";

const WS_URL_DERIBIT = "wss://www.deribit.com/ws/api/v2";

type TDeribitOrderBookEdit = ["new" | "change", number, number];
type TDeribitOrderBookMessage = {
  asks: Array<TDeribitOrderBookEdit>; // type, price, size
  bids: Array<TDeribitOrderBookEdit>;
  timestamp: number;
};
type TExchangeContext = {
  connectStatus: TConnectStatus | -1;
  orderbook: TOrderBook | null;
  lastPrice: number | null;
};

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
    var msg = {
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
    var ws = new WebSocket(WS_URL_DERIBIT);

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (!message.params || !message.params.data) return;

      if (message.params.channel.startsWith("book.BTC-PERPETUAL")) {
        const data: TDeribitOrderBookMessage = message.params.data;

        const deribitEdits: Array<{
          side: TSide;
          edit: TDeribitOrderBookEdit;
        }> = [
          ...data.asks.map((edit) => ({ side: TSide.ASKS, edit })),
          ...data.bids.map((edit) => ({ side: TSide.BIDS, edit })),
        ];

        for (const editEntry of deribitEdits) {
          const { side, edit } = editEntry;
          const [type, price, size] = edit;

          if (type === "new") {
            if (
              side === TSide.BIDS &&
              (obBestBid.current == null || price > obBestBid.current)
            ) {
              obBestBid.current = price;
            } else if (
              side === TSide.ASKS &&
              (obBestAsk.current == null || price < obBestAsk.current)
            ) {
              obBestAsk.current = price;
            }
            obEntries.current.set(price, {
              price,
              size,
              timestamp: data.timestamp,
              side,
            });
            // end of "new"
          } else if (type === "change") {
            const prevEntry = obEntries.current.get(price);
            if (prevEntry == null) {
              console.warn(`Deribit: can't change entry: ${price}!`);
              return;
            }
            const { timestamp, side } = prevEntry;
            obEntries.current.set(price, { price, size, timestamp, side });
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
      } else if (message.params.channel.startsWith("ticker.BTC-PERPETUAL")) {
        const data = message.params.data;
        setLastPrice(data.last_price);

        // TODO: Trades feed...
      } else if (message.params.channel.startsWith("trades.BTC-PERPETUAL")) {
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
  }, [setOrderbook, setReadyState]);

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
