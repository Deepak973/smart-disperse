import { ethers } from "ethers";
import ERC20ABI from "../artifacts/contracts/ERC20.sol/ERC20.json";

export const approveToken = async (
  amount,
  tokenContractAddress,
  decimalValue
) => {
  console.log(decimalValue);

  const { ethereum } = window;
  if (ethereum) {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(
        tokenContractAddress,
        ERC20ABI.abi,
        signer
      );
      const tokenAmount = ethers.utils.parseUnits(amount, decimalValue);
      const tx = await tokenContract.approve(
        "0xB9b0f603Ad0aB9A4103b310592dEA2b7dc7D15e2",
        tokenAmount
      );
      await tx.wait();
      console.log(`${amount} tokens Approved`);

      return true;
    } catch (error) {
      console.error("Error Approving token:", error);
      return false;
    }
  }
};
