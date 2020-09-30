import { TOrderBook } from "../components/OrderBook";
import { TConnectStatus } from "./useWebSocket";

export type TExchangeContext = {
  connectStatus: TConnectStatus | -1;
  orderbook: TOrderBook | null;
  lastPrice: number | null;
};

export type TTrade = {
  price: number;
  direction: "buy" | "sell";
};
