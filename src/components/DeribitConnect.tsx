import React from "react";

import { TOrderBook, TTrade, TConnectStatus } from "./OrderBook";

const WS_URL_DERIBIT = "wss://www.deribit.com/ws/api/v2";

type TDeribitOrderBookMessage = {
  asks: Array<[number, number]>; // price, size
  bids: Array<[number, number]>;
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

  React.useEffect(() => {
    var msg = {
      jsonrpc: "2.0",
      id: 3600,
      method: "public/subscribe",
      params: {
        channels: [
          "book.BTC-PERPETUAL.none.20.100ms",
          "trades.BTC-PERPETUAL.raw",
          "ticker.BTC-PERPETUAL.raw",
        ],
      },
    };
    var ws = new WebSocket(WS_URL_DERIBIT);

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (!message.params || !message.params.data) return;
      // ...
      if (message.params.channel.startsWith("book.BTC-PERPETUAL")) {
        const data: TDeribitOrderBookMessage = message.params.data;
        const entries = new Map();
        data.asks.forEach(([price, size]) => {
          entries.set(price, {
            price,
            size,
            timestamp: data.timestamp,
            side: "asks",
          });
        });
        data.bids.forEach(([price, size]) => {
          entries.set(price, {
            price,
            size,
            timestamp: data.timestamp,
            side: "bids",
          });
        });
        setOrderbook({
          entries,
          bestBid: data.bids[0][0],
          bestAsk: data.asks[0][0],
        });
        // ...
      } else if (message.params.channel.startsWith("trades.BTC-PERPETUAL")) {
        const data: TTrade[] = message.params.data;
        // console.log("deribit trade", data);
        // const { price, direction } = data[data.length - 1];
        // setLastTrade({ price, direction });
      } else if (message.params.channel.startsWith("ticker.BTC-PERPETUAL")) {
        const data = message.params.data;
        setLastPrice(data.last_price);
      } else console.log("deribit ------", message);
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
