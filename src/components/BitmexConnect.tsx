import React from "react";

import { useWebSocket } from "../shared/useWebSocket";
import { TOrderBook, TOrderBookEntry } from "./OrderBook";
import { TExchangeContext } from "../shared/types";

const WS_URL_BITMEX =
  "wss://www.bitmex.com/realtime?subscribe=orderBookL2_25:XBTUSD";
type TBitmexSide = "Sell" | "Buy";
type TBitmexOrderBookEditData_Base = { id: number; side: TBitmexSide };
type TBitmexOrderBookEditData = TBitmexOrderBookEditData_Base & {
  price: number;
  size: number;
  timestamp: number;
};
type TBitmexOrderBookEdit =
  | { action: "partial"; data: TBitmexOrderBookEditData[] }
  | { action: "update"; data: TBitmexOrderBookEditData[] }
  | { action: "insert"; data: TBitmexOrderBookEditData[] }
  | { action: "delete"; data: TBitmexOrderBookEditData_Base[] };
type TBitmexMessage = TBitmexOrderBookEdit;

export const BitmexContext = React.createContext<TExchangeContext>({
  connectStatus: -1,
  orderbook: null,
  lastPrice: null,
});

export const BitmexConnect = ({
  children,
}: {
  children: React.ReactChild | React.ReactChildren;
}) => {
  const { readyState, lastMessage } = useWebSocket<TBitmexMessage>(
    WS_URL_BITMEX
  );
  const [orderbook, setOrderbook] = React.useState<TOrderBook | null>(null);
  // const [lastPrice, setLastPrice] = React.useState<number | null>(null);

  // const obEntries = React.useRef<Map<number, TOrderBookEntry>>(new Map());
  // const obBestBid = React.useRef<number | null>(null);
  // const obBestAsk = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!lastMessage) return;
    switch (lastMessage.action) {
      case "partial": {
        //   if (orderbook != null) return;
        //   const ob = { asks: new Map(), bids: new Map() };
        //   message.data.forEach(({ id, price, side, size }) => {
        //     ob[side === "Sell" ? "asks" : "bids"].set(id, { price, size });
        //   });
        //   setOrderbook(ob);
        break;
      }

      case "update": {
        // if (orderbook == null) return;
        // const ob = {
        //   asks: new Map(orderbook.asks),
        //   bids: new Map(orderbook.bids),
        // };
        // message.data.forEach(({ id, side, size, timestamp }) => {
        //   const s = side === "Sell" ? "asks" : "bids";
        //   const prev = ob[s].get(id);

        //   if (prev) {
        //     ob[s].set(id, { size, price: prev.price, timestamp, side: s });
        //   } else {
        //     // updated moves the side
        //     const opS = side === "Sell" ? "bids" : "asks";
        //     const prevOpS = ob[opS].get(id);
        //     if (!prevOpS) {
        //       console.log("!! INS Can't find id in both sides");
        //       return;
        //     }
        //     ob[s].delete(id);
        //     ob[opS].set(id, { size, price: prevOpS.price, timestamp, side: s });
        //   }
        // });
        // setOrderBook(ob);
        break;
      }

      case "insert": {
        // if (orderBook == null) return;
        // const ob = {
        //   asks: new Map(orderBook.asks),
        //   bids: new Map(orderBook.bids),
        // };
        // message.data.forEach(({ id, side, size, price, timestamp }) => {
        //   const s = side === "Sell" ? "asks" : "bids";
        //   ob[s].set(id, { size, price, timestamp, side: s });
        // });
        // setOrderBook(ob);
        break;
      }

      case "delete": {
        // if (orderBook == null) return;
        // const ob = {
        //   asks: new Map(orderBook.asks),
        //   bids: new Map(orderBook.bids),
        // };
        // message.data.forEach(({ id, side }) => {
        //   const s = side === "Sell" ? "asks" : "bids";
        //   if (!ob[s].get(id)) {
        //     console.log(
        //       "!! DEL Can't find an id, shoud not happen.",
        //       ob.asks.get(id),
        //       ob.bids.get(id)
        //     );
        //     return;
        //   }
        //   ob[s].delete(id);
        // });
        // setOrderBook(ob);
        break;
      }

      default: {
        console.log("bmex ------", lastMessage);
      }
    }
  }, [lastMessage]);

  return (
    <BitmexContext.Provider
      value={{
        connectStatus: readyState,
        orderbook: null,
        lastPrice: null,
      }}
    >
      {children}
    </BitmexContext.Provider>
  );
};

// export const bitmexOrderBook = Recoil.atom<TOrderBook | null>({
//   key: "bitmexOrderBook",
//   default: null,
// });

// export const bitmexConnectStatus = Recoil.atom<TConnectStatus | -1>({
//   key: "bitmexConnectStatus",
//   default: -1,
// });

// export const BitmexConnect = () => {
// const setReadyState = Recoil.useSetRecoilState(bitmexConnectStatus);
// const [orderBook, setOrderBook] = Recoil.useRecoilState(bitmexOrderBook);

// const { lastMessage, readyState } = useWebSocket(WS_URL_BITMEX, {
//   shouldReconnect: (_: CloseEvent) => true,
//   reconnectAttempts: 1000,
//   reconnectInterval: 1200,
//   share: false,
//   retryOnError: true,
// });

// React.useEffect(() => {
//   setReadyState(readyState);
// }, [readyState, setReadyState]);

// React.useEffect(() => {
//   if (!lastMessage || !lastMessage.data) return;
//   const message: TBitmexOrderBookMessage = JSON.parse(lastMessage.data);

//   switch (message.action) {
//     case "partial": {
//       if (orderBook != null) return;
//       const ob = { asks: new Map(), bids: new Map() };
//       message.data.forEach(({ id, price, side, size }) => {
//         ob[side === "Sell" ? "asks" : "bids"].set(id, { price, size });
//       });
//       setOrderBook(ob);
//       break;
//     }

//     case "update": {
//       if (orderBook == null) return;
//       const ob = {
//         asks: new Map(orderBook.asks),
//         bids: new Map(orderBook.bids),
//       };
//       message.data.forEach(({ id, side, size, timestamp }) => {
//         const s = side === "Sell" ? "asks" : "bids";
//         const prev = ob[s].get(id);

//         if (prev) {
//           ob[s].set(id, { size, price: prev.price, timestamp, side: s });
//         } else {
//           // updated moves the side
//           const opS = side === "Sell" ? "bids" : "asks";
//           const prevOpS = ob[opS].get(id);
//           if (!prevOpS) {
//             console.log("!! INS Can't find id in both sides");
//             return;
//           }
//           ob[s].delete(id);
//           ob[opS].set(id, { size, price: prevOpS.price, timestamp, side: s });
//         }
//       });
//       setOrderBook(ob);
//       break;
//     }

//     case "insert": {
//       if (orderBook == null) return;
//       const ob = {
//         asks: new Map(orderBook.asks),
//         bids: new Map(orderBook.bids),
//       };
//       message.data.forEach(({ id, side, size, price, timestamp }) => {
//         const s = side === "Sell" ? "asks" : "bids";
//         ob[s].set(id, { size, price, timestamp, side: s });
//       });
//       setOrderBook(ob);
//       break;
//     }

//     case "delete": {
//       if (orderBook == null) return;
//       const ob = {
//         asks: new Map(orderBook.asks),
//         bids: new Map(orderBook.bids),
//       };
//       message.data.forEach(({ id, side }) => {
//         const s = side === "Sell" ? "asks" : "bids";
//         if (!ob[s].get(id)) {
//           console.log(
//             "!! DEL Can't find an id, shoud not happen.",
//             ob.asks.get(id),
//             ob.bids.get(id)
//           );
//           return;
//         }
//         ob[s].delete(id);
//       });
//       setOrderBook(ob);
//       break;
//     }

//     default: {
//       console.log("bmex ------", message);
//     }
//   }
// }, [lastMessage, orderBook, setOrderBook]);

//   return null;
// };
