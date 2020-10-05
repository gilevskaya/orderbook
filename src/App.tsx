import React from "react";
import Dashboard from "react-grid-dashboard";

import { useDeribitConnect } from "./components/DeribitConnect";
import { BitmexConnect, BitmexContext } from "./components/BitmexConnect";
import { BinanceConnect, BinanceContext } from "./components/BinanceConnect";

import { OrderBook, NewOrderBook } from "./components/OrderBook";
import { connectStatusName } from "./shared/useWebSocket";

function App() {
  // <BitmexConnect>
  //   <BinanceConnect>
  return (
    <div className="h-screen bg-gray-900 text-gray-200 p-1 flex flex-col">
      <OrderBookPage />
    </div>
    //   </BinanceConnect>
    // </BitmexConnect>
  );
}

const Widget = ({
  children,
}: {
  children: React.ReactElement | Array<React.ReactElement>;
}) => (
  <div className="h-full w-full border border-gray-700 rounded-sm flex flex-col">
    {children}
  </div>
);

const OrderBookPage = () => {
  const { connectStatus: bitmexConn } = React.useContext(BitmexContext);
  const { connectStatus: binanceConn } = React.useContext(BinanceContext);
  const {
    readyState: deribitConn,
    orderbook: deribitOrderbook,
    lastPrice: deribitLastPrice,
  } = useDeribitConnect();

  const depth = 15;

  return (
    <Dashboard
      columns={3}
      rows={1}
      layout={{
        deribit: { x: 1, y: 1, w: 1, h: 1 },
        bitmex: { x: 2, y: 1, w: 1, h: 1 },
        binance: { x: 3, y: 1, w: 1, h: 1 },
      }}
      gap={"5pt"}
    >
      <Dashboard.Item id="deribit">
        <Widget>
          <div className="p-2 pt-1 flex-1 flex flex-col">
            <div className="pb-1">
              Deribit:{" "}
              <span className="font-semibold">
                {connectStatusName(deribitConn)}
              </span>
            </div>
            {deribitOrderbook && deribitLastPrice && (
              <NewOrderBook
                orderbook={deribitOrderbook}
                lastPrice={deribitLastPrice}
                depth={depth}
                step={0.5}
              />
            )}
          </div>
        </Widget>
      </Dashboard.Item>

      <Dashboard.Item id="bitmex">
        <Widget>
          <div className="p-2 pt-1 flex-1 flex flex-col">
            <div className="pb-1">
              BitMEX:{" "}
              <span className="font-semibold">
                {connectStatusName(bitmexConn)}
              </span>
            </div>
            <OrderBook exchange="bitmex" depth={depth} step={0.5} />
          </div>
        </Widget>
      </Dashboard.Item>

      <Dashboard.Item id="binance">
        <Widget>
          <div className="p-2 pt-1 flex-1 flex flex-col">
            <div className="pb-1">
              Binance:{" "}
              <span className="font-semibold">
                {connectStatusName(binanceConn)}
              </span>
            </div>
            <OrderBook
              exchange="binance"
              depth={depth}
              step={0.01}
              isSkipEmpty={true}
            />
          </div>
        </Widget>
      </Dashboard.Item>
    </Dashboard>
  );
};

export default App;
