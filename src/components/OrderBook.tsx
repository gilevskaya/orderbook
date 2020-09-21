import React from "react";
import Recoil from "recoil";

import { bitmexOrderBook } from "./BitmexConnect";
import { deribitOrderBook } from "./DeribitConnect";

type TOrderBookEntry = {
  price: number;
  size: number;
};
type TOrderBookSide = Map<number, TOrderBookEntry>;
export type TOrderBook = {
  asks: TOrderBookSide; // id/timestamp -> data
  bids: TOrderBookSide;
};

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

export const OrderBook = ({ exchange }: { exchange: "bitmex" | "deribit" }) => {
  const exchangeOrderBook = {
    bitmex: bitmexOrderBook,
    deribit: deribitOrderBook,
  };
  const orderBook = Recoil.useRecoilValue(exchangeOrderBook[exchange]);

  if (!orderBook) return null;
  return (
    <div>
      <OrderBookSide side="asks" data={orderBook.asks} />
      <div className="h-8">curr price...</div>
      <OrderBookSide side="bids" data={orderBook.bids} />
    </div>
  );
};

const OrderBookSide = ({
  side,
  data,
}: {
  side: "asks" | "bids";
  data: TOrderBookSide;
}) => {
  return (
    <div className="font-mono text-sm border-gray-700 border-t border-dashed">
      {Array.from(data).map(([id, { size, price }]) => {
        return (
          <div
            key={id}
            className="font-mono flex text-xs flex border-gray-700 border-b border-dashed text-right"
          >
            <div
              className="flex-1"
              style={{ color: side === "asks" ? "red" : "green" }}
            >
              {price.toFixed(1)}
            </div>
            <div className="flex-1">{size.toLocaleString()}</div>
          </div>
        );
      })}
    </div>
  );
};
