import React from "react";
import ReactDOM from "react-dom";

const [CPRootShadow] = Shadow.create("root");

ReactDOM.render(
  <div
    style={{
      width: 100,
      height: 100,
      background: "red",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 99,
    }}
  >
    1231231
  </div>,
  CPRootShadow.shadowRoot
);
