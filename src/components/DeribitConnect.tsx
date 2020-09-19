import React from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const WS_URL_DERIBIT = "wss://test.deribit.com/ws/api/v2";

const connectionStatus = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated",
};

export const DeribitConnect = ({ children }: { children: React.ReactNode }) => {
  const [orderBook, setOrderBook] = React.useState({ asks: [], bids: [] });

  //   React.useEffect(() => {
  //     var msg = {
  //       jsonrpc: "2.0",
  //       method: "public/subscribe",
  //       id: 42,
  //       params: {
  //         channels: ["book.BTC-PERPETUAL.100.10.100ms"], // raw
  //       },
  //     };
  //     var ws = new WebSocket(WS_URL_DERIBIT);
  //     ws.onmessage = function (e) {
  //       // do something with the response...
  //       const data = JSON.parse(e.data);
  //       console.log("received from server : ", data);
  //     };
  //     ws.onopen = function () {
  //       ws.send(JSON.stringify(msg));
  //     };
  //   }, []);

  return (
    <div>
      {/* <div>
        The WS is currently: <b>{connectionStatus[readyState]}</b>
      </div> */}
      {/* 
      {lastMessage && (
        <div>Last message: {JSON.stringify(lastMessage.data)}</div>
      )} */}

      {children}

      {/* <div>
          {messageHistory.current.map((message: any, idx: number) => {
            return (
              <div key={idx}>
                <b>{idx}</b>: {JSON.stringify(message.data)}
              </div>
            );
          })}
        </div> */}
    </div>
  );
};
