import React from "react";

// import { bitmexOrderBook } from "./BitmexConnect";
import { DeribitContext } from "./DeribitConnect";

type TOrderBookEntryBase = {
  price: number;
  size: number;
  side: "bids" | "asks";
};
type TOrderBookEntry = TOrderBookEntryBase & {
  timestamp: number;
};
export type TOrderBook = {
  entries: Map<number, TOrderBookEntry>;
  bestBid: number;
  bestAsk: number;
};

export type TTrade = {
  price: number;
  direction: "buy" | "sell";
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

    for (let currDepth = 0; currDepth < depth; currDepth++) {
      let currBidPrice = bestBid - currDepth * 0.5;
      let currAskPrice = bestAsk + currDepth * 0.5;
      const entryBid = entries.get(currBidPrice);
      const entryAsk = entries.get(currAskPrice);
      newbids.push({
        price: currBidPrice,
        size: entryBid != null ? entryBid.size : 0,
        side: "bids",
      });
      newasks.unshift({
        price: currAskPrice,
        size: entryAsk != null ? entryAsk.size : 0,
        side: "asks",
      });
    }
    setBids(newbids);
    setAsks(newasks);
  }, [orderbook, depth]);

  if (!orderbook || !lastPrice) return null;
  return (
    <div>
      {asks.map(({ price, size }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          side="asks"
          price={price}
          size={size}
        />
      ))}
      <div className="pl-3">{lastPrice}</div>
      {bids.map(({ price, size }, i) => (
        <OrderBookEntry
          key={`${price}-${size}`}
          isTop={i === 0}
          side="bids"
          price={price}
          size={size}
        />
      ))}
    </div>
  );
};

const OrderBookEntry = ({
  price,
  size,
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
      style={{ color: side === "asks" ? "red" : "green" }}
    >
      {price.toFixed(1)}
    </div>
    <div className="flex-1">{size.toLocaleString()}</div>
  </div>
);
