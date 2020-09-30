import React from "react";
import Dashboard from "react-grid-dashboard";

import { BitmexConnect, BitmexContext } from "./components/BitmexConnect";
import { DeribitConnect, DeribitContext } from "./components/DeribitConnect";

import { OrderBook } from "./components/OrderBook";
import { connectStatusName } from "./shared/useWebSocket";

function App() {
  return (
    <DeribitConnect>
      <BitmexConnect>
        <div className="h-screen bg-gray-900 text-gray-200 p-1 flex flex-col">
          <OrderBookPage />
        </div>
      </BitmexConnect>
    </DeribitConnect>
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
  const { connectStatus: deribitConn } = React.useContext(DeribitContext);
  const { connectStatus: bitmexConn } = React.useContext(BitmexContext);
  const depth = 15;

  return (
    <Dashboard
      columns={3}
      rows={1}
      layout={{
        deribit: { x: 1, y: 1, w: 1, h: 1 },
        bitmex: { x: 2, y: 1, w: 1, h: 1 },
        trades: { x: 3, y: 1, w: 1, h: 1 },
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
            <OrderBook exchange="deribit" depth={depth} />
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
            <OrderBook exchange="bitmex" depth={depth} />
          </div>
        </Widget>
      </Dashboard.Item>

      <Dashboard.Item id="trades">
        <Widget>
          <div className="p-2 pt-1 flex-1 flex flex-col">
            <div className="pb-1">Trades...</div>
          </div>
        </Widget>
      </Dashboard.Item>
    </Dashboard>
  );
};

export default App;
