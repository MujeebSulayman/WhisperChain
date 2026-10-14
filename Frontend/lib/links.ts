import { BASE_CHAIN } from "./deployments";

/** The messaging app itself. */
export const APP_URL = "/app";

// Placeholders: replace with the real profiles.
export const X_URL = "#";
export const TELEGRAM_URL = "#";

export const explorerAddress = (address: string) => `${BASE_CHAIN.explorer}/address/${address}`;
