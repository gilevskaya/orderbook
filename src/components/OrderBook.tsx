import React from "react";

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
    const { entries, bestAsk, bestBid } = orderbook;
    const newbids: TOrderBookEntryBase[] = [];
    const newasks: TOrderBookEntryBase[] = [];
    let newbidstotal = 0;
    let newaskstotal = 0;
    let currDepth = 0;

    while (
      isSkipEmpty
        ? newbids.length < depth || newasks.length < depth
        : currDepth < depth
    ) {
      let currBidPrice = bestBid - currDepth * step;
      let currAskPrice = bestAsk + currDepth * step;
      const entryBid = entries.get(currBidPrice);
      const entryAsk = entries.get(currAskPrice);
      if (entryBid != null) newbidstotal += entryBid?.size;
      if (entryAsk != null) newaskstotal += entryAsk?.size;
      //
      const sizeBid = entryBid != null ? entryBid.size : 0;
      const sizeAsk = entryAsk != null ? entryAsk.size : 0;
      if ((!isSkipEmpty || sizeBid !== 0) && newbids.length < depth) {
        newbids.push({
          side: TOrderBookSide.BIDS,
          price: currBidPrice,
          size: sizeBid,
          total: newbidstotal,
        });
      }
      if ((!isSkipEmpty || sizeAsk !== 0) && newasks.length < depth) {
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
    setMaxTotal(Math.max(newbids[newbids.length - 1].total, newasks[0].total));
  }, [orderbook, depth, isSkipEmpty, step]);

  if (!orderbook || !lastPrice || !maxTotal) return null;
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
  if (orderbook == null) {
    orderbook = { entries: new Map(), bestBid: -1, bestAsk: -1 };
  }

  for (const { side, edit } of edits) {
    const { price, size, id } = edit;
    orderbook.entries.set(price, { side, price, size, total: 0, id });

    if (size === 0) {
      if (side === TOrderBookSide.ASKS && price === orderbook.bestAsk) {
        orderbook.bestAsk = price + step;
      } else if (side === TOrderBookSide.BIDS && price === orderbook.bestBid) {
        orderbook.bestBid = price - step;
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
  }
  if (orderbook.bestBid === -1 || orderbook.bestAsk === -1) return null;
  return { ...orderbook };
}
