import React from "react";
import "./App.css";
import StripeContainer from "./components/payment/StripeContainer";
function App() {
  return (
    <div className="App">
      <div className="container">
        <div className="row custom-flex">
          <div className="col-md-5">
            <p className="sub-text">PAYMENT PAGE</p>
          </div>
          <div className="col-md-2 draw-line"></div>
          <div className="col-md-5">
            <StripeContainer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
