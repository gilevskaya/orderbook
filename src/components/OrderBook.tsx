import React from "react";
import Recoil from "recoil";

import { bitmexOrderBook } from "./BitmexConnect";

type TOrderBookEntry = {
  price: number;
  size: number;
};

export type TOrderBook = {
  asks: Map<number, TOrderBookEntry>; // id/timestamp -> data
  bids: Map<number, TOrderBookEntry>;
};

export const OrderBook = () => {
  const orderBook = Recoil.useRecoilValue(bitmexOrderBook);

  if (!orderBook) return null;

  return (
    <div>
      <div>
        {Array.from(orderBook.asks).map(([id, { size, price }]) => {
          return (
            <div key={id} style={{ display: "flex", textAlign: "right" }}>
              <div
                style={{ flex: 1, border: "1px dashed black", color: "red" }}
              >
                {price.toFixed(1)}
              </div>
              <div style={{ flex: 1, border: "1px dashed black" }}>
                {size.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      <div>curr price...</div>

      <div>
        {Array.from(orderBook.bids).map(([id, { size, price }]) => {
          return (
            <div key={id} style={{ display: "flex", textAlign: "right" }}>
              <div
                style={{ flex: 1, border: "1px dashed black", color: "green" }}
              >
                {price.toFixed(1)}
              </div>
              <div style={{ flex: 1, border: "1px dashed black" }}>
                {size.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
