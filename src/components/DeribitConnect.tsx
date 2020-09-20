import React from "react";
import Recoil from "recoil";

import { TOrderBook, TConnectStatus } from "./OrderBook";

const WS_URL_DERIBIT = "wss://test.deribit.com/ws/api/v2";

type TDeribitOrderBookMessage = {
  asks: Array<[number, number]>; // price, size
  bids: Array<[number, number]>;
  timestamp: number;
};

export const deribitOrderBook = Recoil.atom<TOrderBook | null>({
  key: "deribitOrderBook",
  default: null,
});

export const deribitConnectStatus = Recoil.atom<TConnectStatus | -1>({
  key: "deribitConnectStatus",
  default: -1,
});

export const DeribitConnect = () => {
  const setReadyState = Recoil.useSetRecoilState(deribitConnectStatus);
  const setOrderBook = Recoil.useSetRecoilState(deribitOrderBook);

  React.useEffect(() => {
    var msg = {
      jsonrpc: "2.0",
      id: 3600,
      method: "public/subscribe",
      params: {
        channels: ["book.BTC-PERPETUAL.none.20.100ms"], // "book.BTC-PERPETUAL.100.1.100ms"],
      },
    };
    var ws = new WebSocket(WS_URL_DERIBIT);

    ws.onmessage = (e) => {
      const message = JSON.parse(e.data);
      if (!message.params) return;
      if (message.params.channel.startsWith("book.BTC-PERPETUAL")) {
        const data: TDeribitOrderBookMessage = message.params.data;
        console.log({ data });
        const ob = {
          asks: new Map(),
          bids: new Map(),
        };
        data.asks.reverse().forEach(([price, size]) => {
          const id = data.timestamp + price;
          ob.asks.set(id, { price, size });
        });
        data.bids.forEach(([price, size]) => {
          const id = data.timestamp + price;
          ob.bids.set(id, { price, size });
        });
        setOrderBook(ob);
      } else console.log("deribit ------", message);
    };
    ws.onopen = () => {
      setReadyState(WebSocket.OPEN);
      ws.send(JSON.stringify(msg));
    };
    ws.onclose = () => {
      setReadyState(WebSocket.CLOSED);
    };
  }, [setOrderBook, setReadyState]);

  return null;
};
