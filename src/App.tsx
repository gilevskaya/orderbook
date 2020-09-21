import React from "react";
import Recoil from "recoil";
import { RecoilRoot } from "recoil";

import { BitmexConnect, bitmexConnectStatus } from "./components/BitmexConnect";
import {
  DeribitConnect,
  deribitConnectStatus,
} from "./components/DeribitConnect";
import { OrderBook, connectStatusName } from "./components/OrderBook";
import Dashboard from "react-grid-dashboard";

function App() {
  return (
    <RecoilRoot>
      <BitmexConnect />
      <DeribitConnect />
      <div className="h-screen bg-gray-900 text-gray-200 p-1 flex flex-col">
        <OrderBookPage />
      </div>
    </RecoilRoot>
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
  const bitmexConn = Recoil.useRecoilValue(bitmexConnectStatus);
  const deribitConn = Recoil.useRecoilValue(deribitConnectStatus);

  return (
    <Dashboard
      columns={2}
      rows={1}
      layout={{
        bitmex: { x: 1, y: 1, w: 1, h: 1 },
        deribit: { x: 2, y: 1, w: 1, h: 1 },
      }}
      gap={"5pt"}
    >
      <Dashboard.Item id="bitmex">
        <Widget>
          <div className="p-2 pt-1 flex-1 flex flex-col">
            <div className="pb-1">
              Bitmex:{" "}
              <span className="font-semibold">
                {connectStatusName(bitmexConn)}
              </span>
            </div>
            <OrderBook exchange="bitmex" />
          </div>
        </Widget>
      </Dashboard.Item>
      <Dashboard.Item id="deribit">
        <Widget>
          <div className="p-2 pt-1 flex-1 flex flex-col">
            <div className="pb-1">
              Deribit:{" "}
              <span className="font-semibold">
                {connectStatusName(deribitConn)}
              </span>
            </div>
            <OrderBook exchange="deribit" />
          </div>
        </Widget>
      </Dashboard.Item>
    </Dashboard>
  );
};

export default App;
