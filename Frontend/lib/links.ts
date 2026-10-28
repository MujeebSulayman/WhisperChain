import { BASE_CHAIN } from "./deployments";

/** The messaging app itself. */
export const APP_URL = "/app";

// Community links. X is still a placeholder.
export const X_URL = "#";
export const TELEGRAM_URL = "https://t.me/+SIuTkwhokfg4ZDBk";

export const explorerAddress = (address: string) => `${BASE_CHAIN.explorer}/address/${address}`;
export const explorerTx = (hash: string) => `${BASE_CHAIN.explorer}/tx/${hash}`;

/** Testnet faucets for Base Sepolia; undefined on mainnet. */
export const FAUCET_URL =
  BASE_CHAIN.testnet ? "https://docs.base.org/base-chain/tools/network-faucets" : undefined;

/** A link that opens Scarf with a new conversation to `address` ready to go. */
export const chatInviteUrl = (address: string) =>
  `${typeof window === "undefined" ? "" : window.location.origin}${APP_URL}?to=${address}`;
