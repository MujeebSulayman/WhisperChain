import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "dotenv/config";

// Only attach the deployer key when one is set, so compile and test work without a .env.
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepoliaBase: {
      url: process.env.SEPOLIA_BASE_URL ?? "https://sepolia.base.org",
      accounts,
      chainId: 84532,
    },
    base: {
      url: process.env.BASE_URL ?? "https://mainnet.base.org",
      accounts,
      chainId: 8453,
    },
  },
  paths: {
    artifacts: "artifacts",
    cache: "cache",
    sources: "contracts",
    tests: "test",
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
    customChains: [
      {
        network: "sepoliaBase",
        chainId: 84532,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=84532",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=8453",
          browserURL: "https://basescan.org",
        },
      },
    ],
  },
};

export default config;
