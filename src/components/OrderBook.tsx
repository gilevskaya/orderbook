import React from "react";
import Recoil from "recoil";

import { bitmexOrderBook } from "./BitmexConnect";
import { deribitOrderBook } from "./DeribitConnect";

type TOrderBookEntry = {
  price: number;
  size: number;
};

export type TOrderBook = {
  asks: Map<number, TOrderBookEntry>; // id/timestamp -> data
  bids: Map<number, TOrderBookEntry>;
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
      <div>
        {Array.from(orderBook.asks).map(([id, { size, price }]) => {
          return (
            <div
              key={id}
              style={{
                display: "flex",
                textAlign: "right",
                borderBottom: "1px dashed black",
              }}
            >
              <div style={{ flex: 1, color: "red" }}>{price.toFixed(1)}</div>
              <div style={{ flex: 1 }}>{size.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      <div>curr price...</div>

      <div>
        {Array.from(orderBook.bids).map(([id, { size, price }]) => {
          return (
            <div
              key={id}
              style={{
                display: "flex",
                textAlign: "right",
                borderBottom: "1px dashed black",
              }}
            >
              <div style={{ flex: 1, color: "green" }}>{price.toFixed(1)}</div>
              <div style={{ flex: 1 }}>{size.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
