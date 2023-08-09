import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    localhost: {
      url: "http://localhost:8545", // Update the port if your local node is running on a different one
      accounts: [process.env.PRIV_KEY_LOCAL || ""]
    },
    bsctest: {
      url: process.env.RPC_ENDPOINT || "https://bsc-testnet.publicnode.com",
      accounts: [process.env.PRIV_KEY || ""]
    }
  },
  etherscan: {
    apiKey: process.env.API_BSC_TEST
  }
};

export default config;
