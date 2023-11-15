import React, { useState } from "react";
import "../../../Styles/dashboard/csvlist.css";
import { crossSendInstance } from "../../../Helpers/ContractInstance";
import { getDestChainAddress } from "../../../Helpers/DestChainAddresses";
import { getTokenBalance } from "../../../Helpers/TokenBalance";
import { getGasFees } from "../../../Helpers/getGasEstimation";
import { approveToken } from "../../../Helpers/ApproveToken";
import DecimalValue from "../../../Helpers/DecimalValue.json";
import tokensContractAddress from "../../../Helpers/GetTokenContractAddress.json";
import ERC20 from "../../../../src/artifacts/contracts/ERC20.sol/ERC20.json";

import { useAccount, useSigner } from "wagmi";
import Modal from "react-modal";
import { ethers } from "ethers";

function SameCsvList() {
  const [csvData, setCsvData] = useState([]);
  const { address, isConnected } = useAccount();
  const [listData, setListData] = useState([]);
  const [isCsvDataEmpty, setIsCsvDataEmpty] = useState(true);
  const [errorModalIsOpen, setErrorModalIsOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [customTokenAddress, setCustomTokenAddress] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [tokenSymbolFinal, setTokenSymbol] = useState("ETH");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setSuccess] = useState(false);
  const [isTokenLoaded, setTokenLoaded] = useState(false);

  const defaultTokenDetails = {
    name: null,
    symbol: null,
    balance: null,
    decimal: null,
  };
  const [tokenDetails, setTokenDetails] = useState(defaultTokenDetails);

  const parseCSV = (content) => {
    const rows = content.split("\n");
    if (rows.length < 2) {
      alert("Invalid CSV format. Please check the CSV file.");
      return [];
    }

    const headers = rows[0].split(",").map((header) => header.trim());

    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].split(",").map((item) => item.trim());

      if (row.length === headers.length) {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index];
        });
        data.push(rowData);
      }
    }

    return data;
  };

  const handleDeleteRow = (index) => {
    const updatedList = [...listData]; // Create a copy of the CSV data
    updatedList.splice(index, 1); // Remove the item at the specified index
    setListData(updatedList); // Update the state with the modified CSV data
  };
  const handleUpdateRow = (index, updatedRecord) => {
    const updatedList = [...listData]; // Create a copy of the CSV data
    updatedList[index] = updatedRecord; // Update the record at the specified index
    setListData(updatedList); // Update the state with the modified CSV data
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRecord = { ...listData[index] }; // Create a copy of the record at the specified index
    // updatedRecord[name] = value; // Update the specific field in the record
    if (name === "tokenAmount" && !value.includes(".")) {
      updatedRecord[name] = String(Number(value));
    } else {
      updatedRecord[name] = value; // Update the specific field in the record
    }
    handleUpdateRow(index, updatedRecord); // Update the record in the listData at the specified index
  };

  const ethereumAddressPattern = /^(0x)?[0-9a-fA-F]{40}$/;

  const validateTokenAmount = (tokenAmount) => {
    if (isNaN(tokenAmount) || parseFloat(tokenAmount) <= 0) {
      return "Token amount is invalid.";
    }
    return null;
  };

  const validateAddress = (address) => {
    if (!ethereumAddressPattern.test(address)) {
      return "Invalid receipient address.";
    }
    return null;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target.result;
        console.log(content);
        try {
          const parsedData = parseCSV(content);

          if (parsedData) {
            setCsvData(parsedData);
            setIsCsvDataEmpty(parsedData.length === 0);
            console.log(parsedData);
            const listData = [];
            for (let i = 0; i < parsedData.length; i++) {
              listData.push({
                receiverAddress: parsedData[i]["Receiver Address"],
                tokenAmount: parsedData[i]["Token Amount"],
              });
            }
            console.log(listData);
            setListData(listData);
            console.log("list data is set");
          } else {
            console.error("Parsed data is empty.");
          }
        } catch (error) {
          console.error("Error parsing CSV data:", error);
        }
      };

      reader.readAsText(file);
    }
  };

  const tokenBalance = async (totalTokenAmount) => {
    const balance = await getTokenBalance(
      address,
      isTokenLoaded
        ? customTokenAddress
        : tokensContractAddress[tokenSymbolFinal]
    );
    const decimal = isTokenLoaded
      ? tokenDetails.decimal
      : DecimalValue[tokenSymbolFinal];
    const userTokenBalance = Math.floor(
      (Number(balance._hex) / 10 ** decimal).toFixed(decimal)
    );

    console.log("user balance:", userTokenBalance);
    console.log("token to transfer:", totalTokenAmount);

    if (userTokenBalance < totalTokenAmount) {
      setErrorMessage(
        `Token exceeded.You don't have enough Token, your ${tokenSymbolFinal} balance is ${userTokenBalance} ${tokenSymbolFinal} and your total transfer amount is ${totalTokenAmount} ${tokenSymbolFinal}`
      );
      setErrorModalIsOpen(true);
      return false;
    } else {
      return true;
    }
  };
  const loadToken = async () => {
    if (customTokenAddress === "") {
      setErrorMessage(`Please Add token Address`);
      setErrorModalIsOpen(true);
      return;
    }
    setTokenDetails(defaultTokenDetails);
    try {
      const { ethereum } = window;
      if (ethereum && customTokenAddress !== "") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        try {
          const erc20 = new ethers.Contract(
            customTokenAddress,
            ERC20.abi,
            signer
          );
          const name = await erc20.name();
          const symbol = await erc20.symbol();
          const balance = await erc20.balanceOf(customTokenAddress);
          const decimals = await erc20.decimals();
          setTokenDetails({
            name,
            symbol,
            balance: ethers.utils.formatEther(balance),
            decimal: decimals,
          });
          setTokenLoaded(true);
          console.log(tokenDetails);
          setTokenSymbol(symbol);
        } catch (error) {
          console.log("loading token error", error);
          setErrorMessage(`Token not Found`);
          setErrorModalIsOpen(true);
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const unloadToken = async () => {
    setTokenDetails(defaultTokenDetails);
    setTokenLoaded(false);
    setTokenSymbol("ETH");
  };

  const executeTransaction = async () => {
    setLoading(true);
    if (tokenSymbolFinal === "") {
      setErrorMessage(`Please Select a Token`);
      setLoading(false);
      setErrorModalIsOpen(true);
      return;
    }
    console.log(tokenSymbolFinal);
    if (tokenSymbolFinal === "ETH") {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        provider
          .getBalance(address)
          .then(async (balance) => {
            const formattedBalance = ethers.utils.formatEther(balance);

            if (formattedBalance <= 0) {
              setLoading(false);
              setErrorMessage(`you do not have enough eth in your wallet`);
              setErrorModalIsOpen(true);
              console.log("");
            } else {
              console.log(`Balance of ${address}: ${formattedBalance} ETH`);
              console.log(listData);
              var recipients = [];
              var values = [];
              var totalAmount = 0;
              for (let i = 0; i < listData.length; i++) {
                totalAmount += parseFloat(listData[i]["tokenAmount"]);
                const etherAmount = listData[i]["tokenAmount"];
                const weiAmount = ethers.utils.parseEther(
                  etherAmount.toString()
                );
                recipients.push(listData[i]["receiverAddress"]);
                values.push(weiAmount);
              }
              console.log(recipients, values);
              console.log(typeof totalAmount);
              if (formattedBalance < totalAmount) {
                setLoading(false);
                setErrorMessage(
                  `Eth Limit Exceeded. Your Eth Balance is ${parseFloat(
                    formattedBalance
                  ).toFixed(
                    4
                  )}  ETH and you total sending Eth amount is ${totalAmount} ETH `
                );
                setErrorModalIsOpen(true);
                return;
              }
              const con = await crossSendInstance();
              const txsendPayment = await con.disperseEther(
                recipients,
                values,
                { value: ethers.utils.parseEther(totalAmount.toString()) }
              );

              const receipt = await txsendPayment.wait();
              setLoading(false);
              setErrorMessage(
                <div
                  dangerouslySetInnerHTML={{
                    __html: `Your Transaction was successful. Visit <a href="https://mumbai.polygonscan.com/tx/${receipt.transactionHash}" target="_blank">here</a> for details.`,
                  }}
                />
              );
              setErrorModalIsOpen(true);
              setListData([]);
              setSuccess(true);
              console.log("Transaction receipt:", receipt);
            }
          })
          .catch((error) => {
            console.error("Error fetching balance:", error);
          });
        return;
      }
    } else {
      var recipients = [];
      var values = [];
      var totalAmount = 0;
      for (let i = 0; i < listData.length; i++) {
        totalAmount += parseFloat(listData[i]["tokenAmount"]);
        const etherAmount = listData[i]["tokenAmount"];
        const weiAmount = ethers.utils.parseEther(etherAmount.toString());
        recipients.push(listData[i]["receiverAddress"]);
        if (isTokenLoaded) {
          values.push(
            ethers.utils.parseUnits(etherAmount, tokenDetails.decimal)
          );
        } else {
          values.push(
            ethers.utils.parseUnits(etherAmount, DecimalValue[tokenSymbolFinal])
          );
        }
      }
      let userTokenBalance;
      console.log("first", totalAmount);
      userTokenBalance = await tokenBalance(totalAmount);
      if (userTokenBalance) {
        const { ethereum } = window;
        const provider = new ethers.providers.Web3Provider(ethereum);
        try {
          const isTokenApproved = await approveToken(
            totalAmount.toString(),
            isTokenLoaded
              ? customTokenAddress
              : tokensContractAddress[tokenSymbolFinal],
            DecimalValue[tokenSymbolFinal]
          );
        } catch (e) {
          console.log("cancelled Approval");
          return;
        }
        console.log(
          tokensContractAddress[tokenSymbolFinal],
          recipients,
          values
        );
        try {
          const con = await crossSendInstance();
          const txsendPayment = await con.disperseToken(
            isTokenLoaded
              ? customTokenAddress
              : tokensContractAddress[tokenSymbolFinal],
            recipients,
            values
          );

          const receipt = await txsendPayment.wait();
          setLoading(false);
          setErrorMessage(
            <div
              dangerouslySetInnerHTML={{
                __html: `Your Transaction was successful. Visit <a href="https://mumbai.polygonscan.com/tx/${receipt.transactionHash}" target="_blank">here</a> for details.`,
              }}
            />
          );
          setErrorModalIsOpen(true);
          setListData([]);
          setSuccess(true);
          console.log("Transaction receipt:", receipt);
        } catch (e) {
          console.log("cancelled");
        }
      }
    }

    // setLoading(true);
    console.log("list of data received from the form:", listData);
    if (listData.length === 0) {
      setErrorMessage(`Please enter necessary details`);
      setErrorModalIsOpen(true);
      return;
    }
  };

  return (
    <div>
      <div className="main-div-for-upload-csv-file">
        <div className="input-div-for-csv">
          <label>Upload File</label> &nbsp; &nbsp;
          <input
            className="input-csv-feild"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div>
        {!isTokenLoaded ? null : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <div>
              <strong>Name:</strong> {tokenDetails.name}
            </div>
            <div>
              <strong>Symbol:</strong> {tokenDetails.symbol}
            </div>
            <div>
              <strong>Balance:</strong> {tokenDetails.balance}
            </div>
          </div>
        )}
      </div>
      <div
        className={`user-form-for-list ${
          errorModalIsOpen ? "blurred-background" : ""
        }`}
      >
        <div className="display-csvfile-here">
          {isCsvDataEmpty ? (
            <p>Upload your CSV File</p>
          ) : (
            <div className="table-wrapper">
              {!isTokenLoaded ? (
                <select
                  className="each-input-of-create-list"
                  name="tokenSymbol"
                  value={tokenSymbolFinal}
                  onChange={(e) => {
                    setTokenSymbol(e.target.value);
                  }}
                >
                  <option value="" disabled selected>
                    Select Token
                  </option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option svalue="aUSDC">aUSDC</option>
                  <option value="axlWETH">axlWETH</option>
                  <option value="wAXL">wAXL</option>
                  <option value="WMATIC">WMATIC</option>
                  <option value="WDEV">WDEV</option>
                </select>
              ) : null}
              {isTokenLoaded ? null : " OR "}
              <input
                type="text"
                className="each-input-of-create-list"
                placeholder="Enter token Address"
                value={customTokenAddress}
                onChange={(e) => setCustomTokenAddress(e.target.value)}
              />
              {isTokenLoaded ? (
                <button
                  className="button-to-add-form-data-unload"
                  onClick={() => {
                    // Add logic to handle the custom token address
                    // For example, you might add it to a list of selected tokens.
                    unloadToken();
                  }}
                >
                  Unload Token
                </button>
              ) : (
                <button
                  className="button-to-add-form-data"
                  onClick={() => {
                    // Add logic to handle the custom token address
                    // For example, you might add it to a list of selected tokens.
                    loadToken();
                  }}
                >
                  Load Token
                </button>
              )}
              <table>
                <thead>
                  <tr>
                    <th>Receiver address</th>
                    <th>Token Amount</th>
                    <th>Token Symbol</th>
                    <th>Chain Name</th>
                    <th>remove</th>
                  </tr>
                </thead>
                <tbody>
                  {listData.map((data, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          className={`each-input-of-create-list ${
                            validateAddress(data.receiverAddress)
                              ? "input-error"
                              : ""
                          }`}
                          type="text"
                          name="receiverAddress"
                          value={data.receiverAddress}
                          placeholder="Enter Receiver Address"
                          onChange={(e) => handleInputChange(e, index)}
                        />
                      </td>
                      <td>
                        <input
                          className={`each-input-of-create-list ${
                            validateTokenAmount(data.tokenAmount)
                              ? "input-error"
                              : ""
                          }`}
                          type="number"
                          name="tokenAmount"
                          value={data.tokenAmount}
                          placeholder="Enter Token Amount"
                          onChange={(e) => handleInputChange(e, index)}
                        />
                      </td>
                      <td>{tokenSymbolFinal}</td>
                      <td>
                        <input
                          className="each-input-of-create-list"
                          type="text"
                          name="chainName"
                          value="scroll"
                          placeholder="Scroll"
                          readOnly
                        />
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteRow(index)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {isCsvDataEmpty ? null : (
            <button
              className="button-to-submit-csv"
              onClick={() => {
                executeTransaction();
              }}
              disabled={loading}
            >
              {loading ? <div className="loader"></div> : "Begin Payment"}
            </button>
          )}
        </div>
      </div>
      <div>
        <a href="/Book2.csv" download="Book2.csv">
          Download sample CSV file
        </a>
      </div>
      <Modal
        className="popup-for-payment"
        isOpen={errorModalIsOpen}
        onRequestClose={() => setErrorModalIsOpen(false)}
        contentLabel="Error Modal"
      >
        {errorMessage ? (
          <>
            <h2>{isSuccess ? "Congratulations!!" : "Error"}</h2>
            <p>{errorMessage}</p>
            <div className="div-to-center">
              <button onClick={() => setErrorModalIsOpen(false)}>Close</button>
            </div>
          </>
        ) : (
          <>
            <h2>Notice</h2>
            <p>{alertMessage}</p>
            <div className="div-to-center">
              <button onClick={() => setErrorModalIsOpen(false)}>Close</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

export default SameCsvList;
