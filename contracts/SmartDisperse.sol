// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./WormholeRelayerSDK.sol";
import "./interfaces/IERC20.sol";

contract SmartDisperse is TokenSender, TokenReceiver {
    uint256 constant GAS_LIMIT = 250_000;

    constructor(
        address _wormholeRelayer,
        address _tokenBridge,
        address _wormhole
    ) TokenBase(_wormholeRelayer, _tokenBridge, _wormhole) {}

    function quoteCrossChainDeposit(
        uint16 targetChain
    ) public view returns (uint256 cost) {
        // Cost of delivering token and payload to targetChain
        uint256 deliveryCost;
        (deliveryCost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );

        // Total cost: delivery cost + cost of publishing the 'sending token' wormhole message
        cost = deliveryCost + wormhole.messageFee();
    }

    function disperseEther(address payable[] memory recipients, uint256[] memory values) external payable {
        for (uint256 i = 0; i < recipients.length; i++)
            recipients[i].transfer(values[i]);
        uint256 balance = address(this).balance;
        if (balance > 0)
            payable(msg.sender).transfer(balance);
    }
    /**
     * @dev Disperse ERC-20 tokens among multiple recipients.
     * @param token ERC-20 token contract address Instance.
     * @param recipients Array of recipient addresses.
     * @param values Array of corresponding token values to be transferred.
     */
    function disperseToken(IERC20 token, address[] memory recipients, uint256[] memory values) external {
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++)
            total += values[i];
        require(token.transferFrom(msg.sender, address(this), total));
        for (uint256 i = 0; i < recipients.length; i++)
            require(token.transfer(recipients[i], values[i]));
    }

    /**
     * @dev Disperse ERC-20 tokens direct among multiple recipients in a single transaction.
     * @param token ERC-20 token contract address Instance.
     * @param recipients Array of recipient addresses.
     * @param values Array of corresponding token values to be transferred.
     */

    function disperseTokenSimple(IERC20 token, address[] memory recipients, uint256[] memory values) external {
        for (uint256 i = 0; i < recipients.length; i++)
            require(token.transferFrom(msg.sender, recipients[i], values[i]));
    }


    struct PaymentData {

            address[] recipients;
            uint256[] amounts;
            uint16 destChain;
            address detContractAddress;
            address token;
            uint256 totalAmount;
        }


    function sendCrossChainDeposit(PaymentData[] memory _paymentData
       
    ) public payable {
        // uint256 cost = quoteCrossChainDeposit(destChain);
        // require(
        //     msg.value == cost,
        //     "msg.value must be quoteCrossChainDeposit(destChain)"
        // );
        uint256 paymentLength = _paymentData.length;
            for(uint256 i=0;i<paymentLength;i++){
        IERC20(_paymentData[i].token).transferFrom(msg.sender, address(this), _paymentData[i].totalAmount);

        // bytes memory payload = abi.encode(recipient);
        bytes memory payload = abi.encode(_paymentData[i].recipients,_paymentData[i].amounts);
        sendTokenWithPayloadToEvm(
           _paymentData[i].destChain,
            _paymentData[i].detContractAddress, // address (on targetChain) to send token and payload to
            payload,
            0, // receiver value
            GAS_LIMIT,
            _paymentData[i].token, // address of IERC20 token contract
            _paymentData[i].totalAmount
        );
    }
    }

    function receivePayloadAndTokens(
        bytes memory payload,
        TokenReceived[] memory receivedTokens,
        bytes32, // sourceAddress
        uint16,
        bytes32 // deliveryHash
    ) internal override onlyWormholeRelayer {
        // require(receivedTokens.length == 1, "Expected 1 token transfers");
        address[] memory recipients;
        uint256[] memory amounts;
        (recipients,amounts) = abi.decode(payload, (address[],uint256[]));
          for (uint256 i = 0; i < recipients.length; i++) {
            IERC20(receivedTokens[0].tokenAddress).transfer(recipients[i], amounts[i]);
        }

    }
}