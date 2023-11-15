import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Landingpage from "./Components/pages/Landingpage";
import Maindashboard from "./Components/Dashboardpages/Maindashboard";
import Footer from "./Components/homepages/Footer";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import "./App.css"; // Import your CSS file here
import Samemaindashboard from "./Components/Dashboardpages/Samechainpages/Samemaindashboard";

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "My RainbowKit App",
  projectId: "YOUR_PROJECT_ID",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function App() {
  return (
    <div className="App">
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <div className="landingpff">
            <div className="background">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>

              <Router>
                <Navbar />
                <Routes>
                  {/* -------------------Cross chain Pages------------------ */}
                  <Route path="/" element={<Landingpage />} />
                  <Route path="/cross-transfers" element={<Maindashboard />} />
                  {/* -------------------------Same chain pages---------------------------- */}
                  <Route
                    path="/same-transfers"
                    element={<Samemaindashboard />}
                  />
                </Routes>
                <Footer />
              </Router>
            </div>
          </div>
        </RainbowKitProvider>
      </WagmiConfig>
    </div>
  );
}

export default App;
