const express = require("express");
const { ethers } = require("ethers");
require("dotenv").config();
const cors = require("cors");
const { encrypted300Value } = require("./encrypted300value");
const app = express();
const PORT = process.env.PORT || 8080;

// Load environment variables
const BASE_SEPOLIA_PROVIDER_URL = process.env.BASE_SEPOLIA_PROVIDER_URL;
const BASE_SEPOLIA_PRIVATE_KEY = process.env.BASE_SEPOLIA_PRIVATE_KEY;
const BASE_SEPOLIA_CONTRACT_ADDRESS = "0x70EA9271f7092a9E014FD03e9DF1dDc741268Cc3";

const INCO_PROVIDER_URL = process.env.INCO_PROVIDER_URL;
const INCO_PRIVATE_KEY = process.env.INCO_PRIVATE_KEY;
const INCO_CONTRACT_ADDRESS = "0x69cD7E7c399894208C6d6007C8fb8B4f03859536";

const POLYGON_PROVIDER_URL = process.env.POLYGON_RPC_URL;
const POLYGON_PRIVATE_KEY = process.env.POLYGON_PRIVATE_KEY;
const POLYGON_INCO_CONTRACT_ADDRESS = "0x0415beC8591e0103CDF104B3d3995E6b3995AD8F";
const POLYGON_CONTRACT_ADDRESS = "0x4E940D5d9669B6F20a3A76c371850dC922766027";

const incoDomainId = 9090;
const baseSepoliaDomainId = 84532;
const polygonId = 2442;

const INCO_ABI = require("./incoContractABI.json"); // Load the contract ABI
const BASE_SEPOLIA_ABI = require("./baseSepoliaContractABI.json"); // Load the contract ABI
const POLYGON_ABI = require("./PolygonContractABI.json");

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your client's URL
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "2mb" })); // Set limit to handle large payloads

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Setup provider and wallet for Sepolia
const baseSepoliaProvider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_PROVIDER_URL);
const baseSepoliaWallet = new ethers.Wallet(BASE_SEPOLIA_PRIVATE_KEY, baseSepoliaProvider);
const baseSepoliaContract = new ethers.Contract(BASE_SEPOLIA_CONTRACT_ADDRESS, BASE_SEPOLIA_ABI, baseSepoliaWallet);

// Setup provider and wallet for Inco
const incoProvider = new ethers.providers.JsonRpcProvider(INCO_PROVIDER_URL);
const incoWallet = new ethers.Wallet(INCO_PRIVATE_KEY, incoProvider);
const incoContract = new ethers.Contract(INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);

const polygonProvider = new ethers.providers.JsonRpcBatchProvider(POLYGON_PROVIDER_URL);
const polygonWallet = new ethers.Wallet(POLYGON_PRIVATE_KEY, polygonProvider);
const polygonContract = new ethers.Contract(POLYGON_CONTRACT_ADDRESS,POLYGON_ABI,polygonWallet);

const polygonIncoContract = new ethers.Contract(POLYGON_INCO_CONTRACT_ADDRESS,INCO_ABI,incoWallet);


//////////////////////////
// Polygon Contract ////// 
//////////////////////////

// Event listener function for Polygon
async function listenToEventspolygonForDispatchProxy() {
  console.log("Listening for Dispatch events on Polygon ...");
  polygonContract.on("DispatchProxy", async (destination, recipient, actualMessage, event) => {
    console.log(`Dispatch event detected on Polygon:
          Destination: ${destination}
          Recipient: ${recipient}
          Message: ${actualMessage}`);
    // Convert recipient bytes32 to address
    const actualRecipient = "0x" + recipient.substring(26, 66);
    try {
      // Call handle function on Inco
      const senderBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(POLYGON_CONTRACT_ADDRESS), 32);
      await callHandleOnPolygonInco(polygonId, senderBytes, actualRecipient, actualMessage);
    } catch (error) {
      console.error("Error processing Dispatch event on Sepolia:", error);
    }
  });
}

// Event listener function for Inco
async function listenToEventsIncoForPolygon() {
  console.log("Listening for Dispatch events on Inco...");

  polygonIncoContract.on("DispatchProxy", async (destination, recipient, actualMessage, event) => {
    console.log(`Dispatch event detected on Inco:
          Destination: ${destination}
          Recipient: ${recipient}
          Message: ${actualMessage}`);
    // Convert recipient bytes32 to address
    const actualRecipient = "0x" + recipient.substring(26, 66);
    try {
      // Call handle function on Inco
      const senderBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(POLYGON_INCO_CONTRACT_ADDRESS), 32);
      await callHandleOnPolygon(incoDomainId, senderBytes, actualRecipient, actualMessage);
    } catch (error) {
      console.error("Error processing Dispatch event on Polygon:", error);
    }
  });
}

// Function to call handle on Sepolia
async function callHandleOnPolygon(origin, sender, recipientAddress, message) {
  try {
    const contractToCall = new ethers.Contract(polygonContract, POLYGON_ABI, polygonWallet);
    const tx = await contractToCall.handle(9090, sender, message, {
      gasLimit: ethers.BigNumber.from(2000000), // Adjust gas limit as needed
    });
    await tx.wait();
  } catch (error) {
    console.error("Error calling handle function on Polygon:", error);
  }
}

// Function to call handle on Inco
async function callHandleOnPolygonInco(origin, sender, recipientAddress, message) {
  try {
    const contractToCall = new ethers.Contract(POLYGON_INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);
    const tx = await contractToCall.handle(origin, sender, message, {
      gasLimit: ethers.BigNumber.from(2000000), // Adjust gas limit as needed
    });
    await tx.wait();

    console.log(`handle function called on Inco with tx: ${tx.hash}`);
  } catch (error) {
    console.error("Error calling handle function on Inco:", error);
  }
}

// Route to handle post request from frontend
app.post("/distribute-funds-polygon", async (req, res) => {
  console.log("hit");
  const { user, userAddress1, userAddresses2, userAddresses3, encryptedData } = req.body;
  console.log(user, userAddress1, userAddresses2, userAddresses3);
  if (!user || !userAddress1 || !userAddresses2 || !userAddresses3 || !encryptedData) {
    return res.status(400).send("Invalid input");
  }

  try {
    await settleDispatchDistributionOfFundsOnPolygon(user, [userAddress1, userAddresses2, userAddresses3], encrypted300Value);
    res.status(200).send("Funds distributed successfully");
  } catch (error) {
    console.error("Error in /distribute-funds-polygon route:", error);
    res.status(500).send("Error distributing funds");
  }
});

// Function to call distributeFunds on Inco
async function settleDispatchDistributionOfFundsOnPolygon(user, userAddresses, encryptedData) {
  try {
    const contractToCall = new ethers.Contract(POLYGON_INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);
    // Convert the values to BigNumber to ensure correct handling
    const maxBaseFee = ethers.BigNumber.from("3000000000");
    const maxPriorityFee = ethers.BigNumber.from("3000000000");
    const gasLimit = ethers.BigNumber.from("30000000"); // 30 million gas

    // Construct overrides with gasLimit, maxFeePerGas (optional if using EIP-1559)
    const overrides = {
      gasLimit: gasLimit, // 30 million gas
      maxFeePerGas: maxBaseFee.add(maxPriorityFee), // maxFeePerGas should be maxBaseFee + maxPriorityFee
    };
    const tx = await contractToCall.distributeFunds(user, userAddresses, encryptedData, overrides);

    await tx.wait();

    console.log(`distributeFunds function called on Inco with tx: ${tx.hash}`);
  } catch (error) {
    console.error("Error calling distributeFunds function on Inco:", error);
  }
}

// Event listener function for Inco
async function listenToDispatchWithdrawFundsOnPolygon() {
  console.log("Listening for WithdrawFunds events on Polygon...");

  baseSepoliaContract.on("DispatchWithdrawFunds", async (user) => {
    console.log(`Dispatch event detected on Polygon:
          user: ${user}`);
    try {
      await settleDispatchWithdrawOfFundsOnPolygon(user);
    } catch (error) {
      console.error("Error processing Dispatch event on Polygon:", error);
    }
  });
}

// Function to call handle on Inco
async function settleDispatchWithdrawOfFundsOnPolygon(user) {
  try {
    const contractToCall = new ethers.Contract(POLYGON_INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);
    const tx = await contractToCall.withdrawFunds(user, {
      gasLimit: ethers.BigNumber.from(10920027),
    });
    await tx.wait();

    console.log(`handle function called on Inco with tx: ${tx.hash}`);
  } catch (error) {
    console.error("Error calling handle function on Inco:", error);
  }
}



//////////////////////////
// Base Sepolia Contract// 
//////////////////////////

// Event listener function for Sepolia
async function listenToEventsBaseSepoliaForDispatchProxy() {
  console.log("Listening for Dispatch events on Base Sepolia...");
  baseSepoliaContract.on("DispatchProxy", async (destination, recipient, actualMessage, event) => {
    console.log(`Dispatch event detected on Sepolia:
          Destination: ${destination}
          Recipient: ${recipient}
          Message: ${actualMessage}`);
    // Convert recipient bytes32 to address
    const actualRecipient = "0x" + recipient.substring(26, 66);
    try {
      // Call handle function on Inco
      const senderBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(BASE_SEPOLIA_CONTRACT_ADDRESS), 32);
      await callHandleOnInco(baseSepoliaDomainId, senderBytes, actualRecipient, actualMessage);
    } catch (error) {
      console.error("Error processing Dispatch event on Sepolia:", error);
    }
  });
}

// Event listener function for Inco
async function listenToEventsInco() {
  console.log("Listening for Dispatch events on Inco...");

  incoContract.on("DispatchProxy", async (destination, recipient, actualMessage, event) => {
    console.log(`Dispatch event detected on Inco:
          Destination: ${destination}
          Recipient: ${recipient}
          Message: ${actualMessage}`);
    // Convert recipient bytes32 to address
    const actualRecipient = "0x" + recipient.substring(26, 66);
    try {
      // Call handle function on Inco
      const senderBytes = ethers.utils.hexZeroPad(ethers.utils.hexlify(INCO_CONTRACT_ADDRESS), 32);
      await callHandleOnBaseSepolia(incoDomainId, senderBytes, actualRecipient, actualMessage);
    } catch (error) {
      console.error("Error processing Dispatch event on Sepolia:", error);
    }
  });
}

// Function to call handle on Sepolia
async function callHandleOnBaseSepolia(origin, sender, recipientAddress, message) {
  try {
    const contractToCall = new ethers.Contract(BASE_SEPOLIA_CONTRACT_ADDRESS, BASE_SEPOLIA_ABI, baseSepoliaWallet);
    const tx = await contractToCall.handle(9090, sender, message, {
      gasLimit: ethers.BigNumber.from(2000000), // Adjust gas limit as needed
    });
    await tx.wait();
  } catch (error) {
    console.error("Error calling handle function on Base Sepolia:", error);
  }
}

// Function to call handle on Inco
async function callHandleOnInco(origin, sender, recipientAddress, message) {
  try {
    const contractToCall = new ethers.Contract(INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);
    const tx = await contractToCall.handle(origin, sender, message, {
      gasLimit: ethers.BigNumber.from(2000000), // Adjust gas limit as needed
    });
    await tx.wait();

    console.log(`handle function called on Inco with tx: ${tx.hash}`);
  } catch (error) {
    console.error("Error calling handle function on Inco:", error);
  }
}

// Route to handle post request from frontend
app.post("/distribute-funds", async (req, res) => {
  console.log("hit");
  const { user, userAddress1, userAddresses2, userAddresses3, encryptedData } = req.body;
  console.log(user, userAddress1, userAddresses2, userAddresses3);
  if (!user || !userAddress1 || !userAddresses2 || !userAddresses3 || !encryptedData) {
    return res.status(400).send("Invalid input");
  }

  try {
    await settleDispatchDistributionOfFunds(user, [userAddress1, userAddresses2, userAddresses3], encrypted300Value);
    res.status(200).send("Funds distributed successfully");
  } catch (error) {
    console.error("Error in /distribute-funds route:", error);
    res.status(500).send("Error distributing funds");
  }
});

// Function to call distributeFunds on Inco
async function settleDispatchDistributionOfFunds(user, userAddresses, encryptedData) {
  try {
    const contractToCall = new ethers.Contract(INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);
    // Convert the values to BigNumber to ensure correct handling
    const maxBaseFee = ethers.BigNumber.from("3000000000");
    const maxPriorityFee = ethers.BigNumber.from("3000000000");
    const gasLimit = ethers.BigNumber.from("30000000"); // 30 million gas

    // Construct overrides with gasLimit, maxFeePerGas (optional if using EIP-1559)
    const overrides = {
      gasLimit: gasLimit, // 30 million gas
      maxFeePerGas: maxBaseFee.add(maxPriorityFee), // maxFeePerGas should be maxBaseFee + maxPriorityFee
    };
    const tx = await contractToCall.distributeFunds(user, userAddresses, encryptedData, overrides);

    await tx.wait();

    console.log(`distributeFunds function called on Inco with tx: ${tx.hash}`);
  } catch (error) {
    console.error("Error calling distributeFunds function on Inco:", error);
  }
}

// Event listener function for Inco
async function listenToDispatchWithdrawFunds() {
  console.log("Listening for WithdrawFunds events on Base Sepolia...");

  baseSepoliaContract.on("DispatchWithdrawFunds", async (user) => {
    console.log(`Dispatch event detected on Base Sepolia:
          user: ${user}`);
    try {
      await settleDispatchWithdrawOfFunds(user);
    } catch (error) {
      console.error("Error processing Dispatch event on Sepolia:", error);
    }
  });
}

// Function to call handle on Inco
async function settleDispatchWithdrawOfFunds(user) {
  try {
    const contractToCall = new ethers.Contract(INCO_CONTRACT_ADDRESS, INCO_ABI, incoWallet);
    const tx = await contractToCall.withdrawFunds(user, {
      gasLimit: ethers.BigNumber.from(10920027),
    });
    await tx.wait();

    console.log(`handle function called on Inco with tx: ${tx.hash}`);
  } catch (error) {
    console.error("Error calling handle function on Inco:", error);
  }
}

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start listening to events on both chains
  listenToEventsBaseSepoliaForDispatchProxy().catch(console.error);
  listenToEventsInco().catch(console.error);
  listenToDispatchWithdrawFunds().catch(console.error);

  listenToDispatchWithdrawFundsOnPolygon().catch(console.error);
  listenToEventsIncoForPolygon().catch(console.error);
  listenToEventspolygonForDispatchProxy().catch(console.error);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});
