import "core-js/stable";
import "regenerator-runtime/runtime";
import React, { FC } from "react";
import ReactDOM from "react-dom";
import SimonSays from "./components/SimonSays";
import "bootstrap-css-only/css/bootstrap.min.css";
import "./scss/styles.scss";

const App: FC = (): JSX.Element => (
  <div id="app">
    <SimonSays />
  </div>
);

ReactDOM.render(<App />, document.getElementById("app"));
