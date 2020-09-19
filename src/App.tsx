import React from "react";
import { RecoilRoot } from "recoil";

import { BitmexConnect } from "./components/BitmexConnect";
import { DeribitConnect } from "./components/DeribitConnect";
import { OrderBook } from "./components/OrderBook";
import Dashboard from "react-grid-dashboard";

import "./App.css";

function App() {
  return (
    <RecoilRoot>
      <div style={{ height: "100vh" }}>
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
              }}
            >
              <BitmexConnect>
                <OrderBook />
              </BitmexConnect>
            </div>
          </Dashboard.Item>
          <Dashboard.Item id="deribit">
            <div
              style={{
                padding: 10,
                background: "#eee",
                height: "100%",
                overflowY: "auto", // adds scrollable
              }}
            >
              <DeribitConnect>Deribit stuffs</DeribitConnect>
            </div>
          </Dashboard.Item>
        </Dashboard>
      </div>
    </RecoilRoot>
  );
}

export default App;

{
  /* <header className="">
        <BitmexConnect>
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
        </BitmexConnect>
      </header> */
}
