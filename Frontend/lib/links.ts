import { BASE_CHAIN } from "./deployments";

/** The messaging app itself. */
export const APP_URL = "/app";

// Community links. X is still a placeholder.
export const X_URL = "#";
export const TELEGRAM_URL = "https://t.me/+SIuTkwhokfg4ZDBk";

export const explorerAddress = (address: string) => `${BASE_CHAIN.explorer}/address/${address}`;
