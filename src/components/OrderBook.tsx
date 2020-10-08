import React from "react";
import { sortedIndex, sortedIndexBy } from "lodash";

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
  asks: number[];
  bids: number[];
};

export const OrderBook = ({
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
  const [maxTotal, setMaxTotal] = React.useState<number | null>(null);

  const decimals = step.toString().split(".")[1].length || 0;

  React.useEffect(() => {
    if (orderbook == null) return;
    const { entries, asks: obasks, bids: obbids } = orderbook;
    if (obasks.length === 0 || obbids.length === 0) return;
    let newAsksPrice: number[] = [];
    let newBidsPrice: number[] = [];

    if (isSkipEmpty) {
      newAsksPrice = obasks.slice(0, depth);
      newBidsPrice = obbids.slice(0, depth);
    } else {
      const bestAsk = obasks[0];
      const bestBid = obbids[0];
      for (let currDepth = 0; currDepth < depth; currDepth++) {
        newBidsPrice.push(bestBid - currDepth * step);
        newAsksPrice.push(bestAsk + currDepth * step);
      }
    }
    let newaskstotal = 0;
    let newbidstotal = 0;
    setAsks(
      newAsksPrice.map((price) => {
        const entry = entries.get(price);
        const size = entry ? entry.size : 0;
        newaskstotal += size;
        return {
          side: TOrderBookSide.ASKS,
          price,
          size: size,
          total: newaskstotal,
        };
      })
    );
    setBids(
      newBidsPrice.map((price) => {
        const entry = entries.get(price);
        const size = entry ? entry.size : 0;
        newbidstotal += size;
        return {
          side: TOrderBookSide.BIDS,
          price,
          size: size,
          total: newbidstotal,
        };
      })
    );
    setMaxTotal(Math.max(newaskstotal, newbidstotal));
  }, [orderbook, depth, isSkipEmpty, step]);

  if (!orderbook || !lastPrice || !maxTotal) return null;
  return (
    <div>
      {[...asks].reverse().map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`a-${price}-${size}`}
          isTop={i === 0}
          decimals={decimals}
          side={TOrderBookSide.ASKS}
          price={price}
          size={size}
          total={total}
          maxTotal={maxTotal}
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
          maxTotal={maxTotal}
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
  maxTotal,
}: TOrderBookEntryBase & {
  isTop?: boolean;
  decimals: number;
  maxTotal: number;
}) => {
  const text = side === TOrderBookSide.ASKS ? "text-red-500" : "text-green-500";
  const bg = side === TOrderBookSide.ASKS ? "bg-red-600" : "bg-green-700";
  const bgWidth = Math.round((total / maxTotal) * 95); // 95 instead of 100 to make it pretty
  return (
    <div
      className={`font-mono flex text-xs flex border-gray-700 border-b ${
        isTop ? "border-t" : ""
      } border-dashed text-right`}
    >
      <div className={`w-16 ${text}`}>{price.toFixed(decimals)}</div>

      <div className="flex-1 text-gray-600">{size.toLocaleString()}</div>
      <div className="flex-1 relative">
        <div className="z-10 absolute w-full" style={{ top: 0, right: 0 }}>
          {total.toLocaleString()}
        </div>
        <div
          className={`${bg} opacity-50 h-full`}
          style={{ width: `${bgWidth}%`, float: "right" }} // transform: `scaleX(${0.2})`
        ></div>
      </div>
    </div>
  );
};

// ...

export function applyExchangeOrderBookEdits<T>(
  orderbook: TOrderBook | null,
  edits: Array<{
    side: TOrderBookSide;
    edit: TOrderBookEdit;
  }>,
  step: number = 0.5
): TOrderBook | null {
  let { entries, asks, bids }: TOrderBook =
    orderbook != null ? orderbook : { entries: new Map(), asks: [], bids: [] };

  for (const { side, edit } of edits) {
    const { price, size, id } = edit;

    if (size === 0) {
      // deletion
      entries.delete(price);
      if (side === TOrderBookSide.ASKS) {
        const i = asks.indexOf(price);
        if (i !== -1) delete asks[i];
      } else {
        const i = bids.indexOf(price);
        if (i !== -1) delete bids[i];
      }
    } else {
      // insert
      entries.set(price, { side, price, size, total: 0, id });
      if (side === TOrderBookSide.ASKS) {
        if (asks.indexOf(price) === -1) {
          asks = sortedInsert(price, asks, true);
        }
      } else {
        if (bids.indexOf(price) === -1) {
          bids = sortedInsert(price, bids, false);
        }
      }
    }
  }
  return {
    entries,
    asks: asks.filter((e) => e),
    bids: bids.filter((e) => e),
  };
}

function sortedInsert(value: number, array: number[], isAZ: boolean) {
  const a = [...array];
  if (isAZ) a.splice(sortedIndex(array, value), 0, value);
  else
    a.splice(
      sortedIndexBy(array, value, (x) => -x),
      0,
      value
    );
  return a;
}
