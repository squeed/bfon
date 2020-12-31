import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import {
  BrowserRouter as Router,
  Switch,
  Route} from "react-router-dom";

import Instructions from "./Instructions";

import { Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-mui'
//import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route path="/instructions">
          <Instructions />
        </Route>
        <Route path="/">
          <AlertProvider template={AlertTemplate}>
            <App />
          </AlertProvider>
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals(console.log);
