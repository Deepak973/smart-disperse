export const getDestChainAddress = async (chainName) => {
  switch (chainName) {
    case "Ethereum":
      return "0x3E02bCf083201f40a7Ba3Aa56a88970B7cCBb5Bc";
      break;
    case "Base":
      return "0xdbb86968f591537f30a5b3feb8d4cc6aec3c603b";
      break;
    case "Polygon":
      return "0xB9b0f603Ad0aB9A4103b310592dEA2b7dc7D15e2";
      break;
    case "Moonbeam":
      return "0xd38875CCD7a985f64a6d9Ad8fE45a2f0dEB2ae7e";
      break;
    case "arbitrum":
      return "0x05c106CaD72b04c09F228286fEd949eC6f9539a7";
      break;
    case "celo":
      return "0x05c106CaD72b04c09F228286fEd949eC6f9539a7";
      break;
  }
};
