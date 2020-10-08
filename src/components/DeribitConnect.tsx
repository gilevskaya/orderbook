import React from "react";

import { useWebSocket } from "../shared/useWebSocket";
import {
  applyExchangeOrderBookEdits,
  TOrderBook,
  TOrderBookSide,
} from "./OrderBook";

const WS_URL_DERIBIT = "wss://www.deribit.com/ws/api/v2";

type TDeribitOrderBookEdit = ["new" | "change" | "delete", number, number]; // type, price, size
type TDeribitOrderBookMessage = {
  params: {
    channel: "book.BTC-PERPETUAL.raw";
    data: {
      asks: TDeribitOrderBookEdit[];
      bids: TDeribitOrderBookEdit[];
      change_id: number;
    };
  };
};
type TDeribitTickerMessage = {
  params: {
    channel: "ticker.BTC-PERPETUAL.raw";
    data: {
      last_price: number;
      best_bid_price: number;
      best_ask_price: number;
    };
  };
};
type TDeribitMessage = TDeribitOrderBookMessage | TDeribitTickerMessage;

export const useDeribitConnect = () => {
  const { readyState, lastMessage, sendMessage } = useWebSocket<
    TDeribitMessage
  >(WS_URL_DERIBIT, {
    onOpen: () => {
      sendMessage(
        JSON.stringify({
          jsonrpc: "2.0",
          id: 3600,
          method: "public/subscribe",
          params: {
            channels: [
              "book.BTC-PERPETUAL.raw",
              // "trades.BTC-PERPETUAL.raw",
              "ticker.BTC-PERPETUAL.raw",
            ],
          },
        })
      );
    },
  });
  const [orderbook, setOrderbook] = React.useState<TOrderBook | null>(null);
  const [lastPrice, setLastPrice] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!lastMessage?.params?.data) return;

    switch (lastMessage.params.channel) {
      case "book.BTC-PERPETUAL.raw": {
        const { bids, asks, change_id: id } = lastMessage.params.data;

        const mapEditFormat = (edit: TDeribitOrderBookEdit) => {
          const [, price, size] = edit;
          return { id, price, size };
        };

        setOrderbook((ob) =>
          applyExchangeOrderBookEdits<TDeribitOrderBookEdit>(ob, [
            ...asks.map((edit) => ({
              side: TOrderBookSide.ASKS,
              edit: mapEditFormat(edit),
            })),
            ...bids.map((edit) => ({
              side: TOrderBookSide.BIDS,
              edit: mapEditFormat(edit),
            })),
          ])
        );
        break;
      }
      case "ticker.BTC-PERPETUAL.raw": {
        setLastPrice(lastMessage.params.data.last_price);
        if (orderbook != null && orderbook.asks[0] && orderbook.bids[0]) {
          if (
            lastMessage.params.data.best_bid_price !== orderbook.bids[0] ||
            lastMessage.params.data.best_ask_price !== orderbook.asks[0]
          ) {
            console.log("deribit asks/bids mismatch...");
            console.log(
              `${lastMessage.params.data.best_ask_price}|${orderbook.asks[0]}`,
              `${lastMessage.params.data.best_bid_price}|${orderbook.bids[0]}`
            );
            sendMessage(
              JSON.stringify({
                jsonrpc: "2.0",
                id: 3600,
                method: "public/subscribe",
                params: {
                  channels: [
                    "book.BTC-PERPETUAL.raw",
                    // "trades.BTC-PERPETUAL.raw",
                    "ticker.BTC-PERPETUAL.raw",
                  ],
                },
              })
            );
          }
        }

        break;
      }
      default: {
        console.log("deribit", lastMessage);
      }
    }
  }, [lastMessage]);

  return { readyState, orderbook, lastPrice };
};
