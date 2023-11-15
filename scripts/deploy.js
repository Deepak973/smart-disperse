// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const crossSend = await hre.ethers.deployContract("SmartPortal", [
    "0x0591C25ebd0580E0d4F27A82Fc2e24E7489CB5e0",
    "0x51a02d0dcb5e52F5b92bdAA38FA013C91c7309A9",
    "0x0CBE91CF822c73C2315FB05100C2F714765d5c20",
  ]);

  await crossSend.waitForDeployment();

  console.log(`deployed to ${crossSend.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
