import React from "react";
import { Link } from "react-router-dom";
import "../Styles/navbar.css";
import smartlogo from "../../src/Assets/Smart Portal light.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Navbar() {
  return (
    <div>
      <div className="div-to-flex-logo-connect-wallet">
        <div class="logo-container">
          <a class="logo-link" href="/">
            Smart Disperse
          </a>
        </div>
        <div className="connect-wallet-button-div">
          <ConnectButton />
        </div>
      </div>
    </div>
  );
}

export default Navbar;
