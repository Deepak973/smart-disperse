import axios from "axios";

export const getSentTransaction = async (address) => {
  return new Promise(async (resolve, reject) => {
    // Define the parameters
    // const parameters = {
    //   method: "searchGMP",
    //   size: 20,
    //   senderAddress: address,
    //   sourceContractAddress: "0xB9b0f603Ad0aB9A4103b310592dEA2b7dc7D15e2",
    // };

    // Define the API endpoint
    const apiUrl =
      "https://api.testnet.wormholescan.io/api/v1/address/0xe57f4c84539a6414C4Cf48f135210e01c477EFE0";

    try {
      // Make the POST request
      const response = await axios.post(apiUrl);
      console.log(response);
      // Handle the response data here
      const gasFees = response.data; // Assuming the response contains gas fee data

      resolve(gasFees);
    } catch (error) {
      // Handle any errors
      console.error("Error:", error);
      reject(error);
    }
  });
};
