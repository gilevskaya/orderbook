import React from "react";

// import { bitmexOrderBook } from "./BitmexConnect";
import { DeribitContext } from "./DeribitConnect";

const ORDERBOOK_STEP = 0.5;

// SHARED
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
export enum TSide {
  BIDS = "bids",
  ASKS = "asks",
}
export type TTrade = {
  price: number;
  direction: "buy" | "sell";
};
//

type TOrderBookEntryBase = {
  side: TSide;
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
  exchange: "deribit";
  depth: number;
}) => {
  const exchangeContext = {
    deribit: DeribitContext,
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
        side: TSide.BIDS,
        price: currBidPrice,
        size: entryBid != null ? entryBid.size : 0,
        total: newbidstotal,
      });
      newasks.unshift({
        side: TSide.ASKS,
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
          side={TSide.ASKS}
          price={price}
          size={size}
          total={total}
        />
      ))}
      <div className="pl-3">{lastPrice}</div>
      {bids.map(({ price, size, total }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          side={TSide.BIDS}
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
      style={{ color: side === TSide.ASKS ? "red" : "green" }}
    >
      {price.toFixed(1)}
    </div>

    <div className="flex-1">{size.toLocaleString()}</div>
    <div className="flex-1">{total.toLocaleString()}</div>
  </div>
);
