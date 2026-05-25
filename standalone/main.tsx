import React from "react";
import ReactDOM from "react-dom/client";
import "../src/styles.css";
import { Workbench } from "./Workbench";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Workbench />
  </React.StrictMode>
);
