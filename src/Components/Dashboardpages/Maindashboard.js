import React, { useState } from "react";
import "../../Styles/dashboard/maindashboard.css";
import Createlist from "./Createlist";
import Csvlist from "./Csvlist";
import Viewlist from "./Viewlist";
import { useNavigate } from "react-router-dom";
import { useAccount, useSigner } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

function Maindashboard() {
  const [activeTab, setActiveTab] = useState("create");
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  if (!isConnected) {
    openConnectModal();
  } else {
  }

  const renderComponent = (tab) => {
    switch (tab) {
      case "create":
        return <Createlist />;
      case "list":
        return <Csvlist />;
      case "view":
        return <Viewlist />;
      default:
        return <Createlist />;
    }
  };

  return (
    <div>
      <div className="main-div-of-dashboard">
        <div className="title-div-dashboard">
          <h1>Single-Click Multi-Chain Disperse</h1>
        </div>
        <div className="main-div-for-all-option-dashboard">
          <div className="menu-bar-dashboard">
            <button
              id="create"
              className={activeTab === "create" ? "active" : ""}
              onClick={() => setActiveTab("create")}
            >
              Create Transaction List
            </button>
            <button
              id="csv"
              className={activeTab === "list" ? "active" : ""}
              onClick={() => setActiveTab("list")}
            >
              Upload Transaction List
            </button>
            <button
              id="view"
              className={activeTab === "view" ? "active" : ""}
              onClick={() => setActiveTab("view")}
              disabled
            >
              View Transactions (coming soon...)
            </button>
          </div>
        </div>
        <div className="div-to-center-the-component-render">
          <div className="component-container-dashboard">
            {renderComponent(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Maindashboard;
