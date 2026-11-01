import { BASE_CHAIN } from "./deployments";

/** The messaging app itself. */
export const APP_URL = "/app";

// Community links. X is still a placeholder.
/** Hidden for now; set to true to bring back the X and Telegram links across the site. */
export const SHOW_SOCIALS = false;
export const X_URL = "#";
export const TELEGRAM_URL = "https://t.me/+SIuTkwhokfg4ZDBk";

export const explorerAddress = (address: string) => `${BASE_CHAIN.explorer}/address/${address}`;
export const explorerTx = (hash: string) => `${BASE_CHAIN.explorer}/tx/${hash}`;


/** A link that opens Scarf with a new conversation to `address` ready to go. */
export const chatInviteUrl = (address: string) =>
  `${typeof window === "undefined" ? "" : window.location.origin}${APP_URL}?to=${address}`;
