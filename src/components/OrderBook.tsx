import React from "react";

import { DeribitContext } from "./DeribitConnect";
import { BitmexContext } from "./BitmexConnect";

const ORDERBOOK_STEP = 0.5;

export enum TOrderBookSide {
  BIDS = "bids",
  ASKS = "asks",
}
type TOrderBookEntryBase = {
  side: TOrderBookSide;
  price: number;
  size: number;
  total: number;
};
export type TOrderBookEntry = TOrderBookEntryBase & {
  timestamp: number;
};
export type TOrderBook = {
  entries: Map<number, TOrderBookEntry>;
  bestBid: number;
  bestAsk: number;
};

export const OrderBook = ({
  exchange,
  depth,
}: {
  exchange: "deribit" | "bitmex";
  depth: number;
}) => {
  const exchangeContext = {
    deribit: DeribitContext,
    bitmex: BitmexContext,
  };
  const { orderbook, lastPrice } = React.useContext(exchangeContext[exchange]);
  const [bids, setBids] = React.useState<TOrderBookEntryBase[]>([]);
  const [asks, setAsks] = React.useState<TOrderBookEntryBase[]>([]);

  React.useEffect(() => {
    if (orderbook == null) return;
    const { entries, bestAsk, bestBid } = orderbook;
    const newbids: TOrderBookEntryBase[] = [];
    const newasks: TOrderBookEntryBase[] = [];
    let newbidstotal = 0;
    let newaskstotal = 0;

    for (let currDepth = 0; currDepth < depth; currDepth++) {
      let currBidPrice = bestBid - currDepth * ORDERBOOK_STEP;
      let currAskPrice = bestAsk + currDepth * ORDERBOOK_STEP;
      const entryBid = entries.get(currBidPrice);
      const entryAsk = entries.get(currAskPrice);
      if (entryBid != null) newbidstotal += entryBid?.size;
      if (entryAsk != null) newaskstotal += entryAsk?.size;
      newbids.push({
        side: TOrderBookSide.BIDS,
        price: currBidPrice,
        size: entryBid != null ? entryBid.size : 0,
        total: newbidstotal,
      });
      newasks.unshift({
        side: TOrderBookSide.ASKS,
        price: currAskPrice,
        size: entryAsk != null ? entryAsk.size : 0,
        total: newaskstotal,
      });
    }
    setBids(newbids);
    setAsks(newasks);
  }, [orderbook, depth]);

  if (!orderbook || !lastPrice) return null;
  return (
    <div>
      {asks.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          side={TOrderBookSide.ASKS}
          price={price}
          size={size}
          total={total}
        />
      ))}
      <div className="flex py-1">
        <div className="flex-1 text-right">{lastPrice.toFixed(1)}</div>
        <div className="" style={{ flex: "2 2 0%" }}></div>
      </div>
      {bids.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          side={TOrderBookSide.BIDS}
          price={price}
          size={size}
          total={total}
        />
      ))}
    </div>
  );
};

const OrderBookEntry = ({
  price,
  size,
  total,
  side,
  isTop,
}: TOrderBookEntryBase & { isTop?: boolean }) => (
  <div
    className={`font-mono flex text-xs flex border-gray-700 border-b ${
      isTop ? "border-t" : ""
    } border-dashed text-right`}
  >
    <div
      className="flex-1"
      style={{ color: side === TOrderBookSide.ASKS ? "red" : "green" }}
    >
      {price.toFixed(1)}
    </div>

    <div className="flex-1">{size.toLocaleString()}</div>
    <div className="flex-1">{total.toLocaleString()}</div>
  </div>
);
