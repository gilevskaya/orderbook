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
      <div style={{ height: "100vh" }}>
        <OrderBookPage />
      </div>
    </RecoilRoot>
  );
}

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
      gap={"10px"} // optional, string or number
    >
      <Dashboard.Item id="bitmex">
        <div
          style={{
            padding: 10,
            background: "#eee",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <div>
            Bitmex: <b>{connectStatusName(bitmexConn)}</b>
          </div>
          <OrderBook exchange="bitmex" />
        </div>
      </Dashboard.Item>
      <Dashboard.Item id="deribit">
        <div
          style={{
            padding: 10,
            background: "#eee",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <div>
            Deribit: <b>{connectStatusName(deribitConn)}</b>
          </div>
          <OrderBook exchange="deribit" />
        </div>
      </Dashboard.Item>
    </Dashboard>
  );
};

export default App;
