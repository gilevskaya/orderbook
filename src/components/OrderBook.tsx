import React from "react";

import { BitmexContext } from "./BitmexConnect";
import { BinanceContext } from "./BinanceConnect";

export enum TOrderBookSide {
  BIDS = "bids",
  ASKS = "asks",
}
export type TOrderBookEdit = {
  id: number;
  price: number;
  size: number;
  sizeBTC?: number;
};
type TOrderBookEntryBase = {
  side: TOrderBookSide;
  price: number;
  size: number;
  sizeBTC?: number;
  total: number;
};
export type TOrderBookEntry = TOrderBookEntryBase & {
  id: number;
};
export type TOrderBookEntries = Map<number, TOrderBookEntry>;
export type TOrderBook = {
  entries: TOrderBookEntries;
  bestBid: number;
  bestAsk: number;
};

export const OrderBook = ({
  exchange,
  depth,
  step,
  isSkipEmpty,
}: {
  exchange: "bitmex" | "binance";
  depth: number;
  step: number;
  isSkipEmpty?: boolean;
}) => {
  const exchangeContext = {
    bitmex: BitmexContext,
    binance: BinanceContext,
  };
  const { orderbook, lastPrice } = React.useContext(exchangeContext[exchange]);
  const [bids, setBids] = React.useState<TOrderBookEntryBase[]>([]);
  const [asks, setAsks] = React.useState<TOrderBookEntryBase[]>([]);

  const decimals = step.toString().split(".")[1].length || 0;

  React.useEffect(() => {
    if (orderbook == null) return;
    const { entries, bestAsk, bestBid } = orderbook;
    const newbids: TOrderBookEntryBase[] = [];
    const newasks: TOrderBookEntryBase[] = [];
    let newbidstotal = 0;
    let newaskstotal = 0;

    let currDepth = 0;

    while (isSkipEmpty ? currDepth < depth : currDepth < depth) {
      let currBidPrice = bestBid - currDepth * step;
      let currAskPrice = bestAsk + currDepth * step;
      const entryBid = entries.get(currBidPrice);
      const entryAsk = entries.get(currAskPrice);
      if (entryBid != null) newbidstotal += entryBid?.size;
      if (entryAsk != null) newaskstotal += entryAsk?.size;

      const size = entryBid != null ? entryBid.size : 0;
      if (!isSkipEmpty || size !== 0) {
        newbids.push({
          side: TOrderBookSide.BIDS,
          price: currBidPrice,
          size,
          total: newbidstotal,
        });
        newasks.unshift({
          side: TOrderBookSide.ASKS,
          price: currAskPrice,
          size,
          total: newaskstotal,
        });
      }
      currDepth++;
    }
    setBids(newbids);
    setAsks(newasks);
  }, [orderbook, depth, isSkipEmpty, step]);

  if (!orderbook || !lastPrice) return null;
  return (
    <div>
      {asks.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          decimals={decimals}
          side={TOrderBookSide.ASKS}
          price={price}
          size={size}
          total={total}
        />
      ))}
      <div className="flex py-1">
        <div className="flex-1 text-right">{lastPrice.toFixed(decimals)}</div>
        <div className="" style={{ flex: "2 2 0%" }}></div>
      </div>
      {bids.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          decimals={decimals}
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
  decimals,
  isTop,
}: TOrderBookEntryBase & { isTop?: boolean; decimals: number }) => (
  <div
    className={`font-mono flex text-xs flex border-gray-700 border-b ${
      isTop ? "border-t" : ""
    } border-dashed text-right`}
  >
    <div
      className="w-16"
      style={{ color: side === TOrderBookSide.ASKS ? "red" : "green" }}
    >
      {price.toFixed(decimals)}
    </div>

    <div className="flex-1">{size.toLocaleString()}</div>
    <div className="flex-1">{total.toLocaleString()}</div>
  </div>
);

export const NewOrderBook = ({
  orderbook,
  lastPrice,
  depth,
  step,
  isSkipEmpty,
}: {
  orderbook: TOrderBook;
  lastPrice: number;
  depth: number;
  step: number;
  isSkipEmpty?: boolean;
}) => {
  const [bids, setBids] = React.useState<TOrderBookEntryBase[]>([]);
  const [asks, setAsks] = React.useState<TOrderBookEntryBase[]>([]);

  const decimals = step.toString().split(".")[1].length || 0;

  React.useEffect(() => {
    if (orderbook == null) return;
    const { entries, bestAsk, bestBid } = orderbook;
    const newbids: TOrderBookEntryBase[] = [];
    const newasks: TOrderBookEntryBase[] = [];
    let newbidstotal = 0;
    let newaskstotal = 0;

    let currDepth = 0;

    while (isSkipEmpty ? currDepth < depth : currDepth < depth) {
      let currBidPrice = bestBid - currDepth * step;
      let currAskPrice = bestAsk + currDepth * step;
      const entryBid = entries.get(currBidPrice);
      const entryAsk = entries.get(currAskPrice);
      if (entryBid != null) newbidstotal += entryBid?.size;
      if (entryAsk != null) newaskstotal += entryAsk?.size;
      //
      const sizeBid = entryBid != null ? entryBid.size : 0;
      const sizeAsk = entryAsk != null ? entryAsk.size : 0;
      if (!isSkipEmpty || sizeBid !== 0) {
        newbids.push({
          side: TOrderBookSide.BIDS,
          price: currBidPrice,
          size: sizeBid,
          total: newbidstotal,
        });
      }
      if (!isSkipEmpty || sizeAsk !== 0) {
        newasks.unshift({
          side: TOrderBookSide.ASKS,
          price: currAskPrice,
          size: sizeAsk,
          total: newaskstotal,
        });
      }
      currDepth++;
    }
    setBids(newbids);
    setAsks(newasks);
  }, [orderbook, depth, isSkipEmpty, step]);

  if (!orderbook || !lastPrice) return null;
  return (
    <div>
      {asks.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`a-${price}-${size}`}
          isTop={i === 0}
          decimals={decimals}
          side={TOrderBookSide.ASKS}
          price={price}
          size={size}
          total={total}
        />
      ))}
      <div className="flex py-1">
        <div className="flex-1 text-right">{lastPrice.toFixed(decimals)}</div>
        <div className="" style={{ flex: "2 2 0%" }}></div>
      </div>
      {bids.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`b-${price}-${size}`}
          isTop={i === 0}
          decimals={decimals}
          side={TOrderBookSide.BIDS}
          price={price}
          size={size}
          total={total}
        />
      ))}
    </div>
  );
};

export function applyExchangeOrderBookEdits<T>(
  orderbook: TOrderBook | null,
  asks: T[] = [],
  bids: T[] = [],
  mapEditFormat: Function
): TOrderBook {
  const edits: Array<{
    side: TOrderBookSide;
    edit: TOrderBookEdit;
  }> = [
    ...asks.map((edit) => ({
      side: TOrderBookSide.ASKS,
      edit: mapEditFormat(edit),
    })),
    ...bids.map((edit) => ({
      side: TOrderBookSide.BIDS,
      edit: mapEditFormat(edit),
    })),
  ];

  if (orderbook == null) {
    orderbook = { entries: new Map(), bestBid: -1, bestAsk: -1 };
  }

  for (const { side, edit } of edits) {
    const { price, size, id } = edit;
    if (size === 0) {
      if (side === "asks" && price === orderbook.bestAsk) {
        orderbook.bestAsk = price + 0.5;
      } else if (side === "bids" && price === orderbook.bestBid) {
        orderbook.bestBid = price - 0.5;
      }
    } else if (
      side === TOrderBookSide.BIDS &&
      (orderbook.bestBid === -1 || price > orderbook.bestBid)
    ) {
      orderbook.bestBid = price;
    } else if (
      side === TOrderBookSide.ASKS &&
      (orderbook.bestAsk === -1 || price < orderbook.bestAsk)
    ) {
      orderbook.bestAsk = price;
    }
    orderbook.entries.set(price, { side, price, size, total: 0, id });
  }
  return { ...orderbook };
}
