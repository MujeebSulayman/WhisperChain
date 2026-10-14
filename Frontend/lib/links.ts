import { BASE_CHAIN } from "./deployments";

/** The messaging app itself. */
export const APP_URL = "/app";
export const GITHUB_URL = "https://github.com/MujeebSulayman/WhisperChain";
export const CONTRACTS_SRC_URL = `${GITHUB_URL}/tree/main/Contract/contracts`;
export const FRONTEND_SRC_URL = `${GITHUB_URL}/tree/main/Frontend`;

export const explorerAddress = (address: string) => `${BASE_CHAIN.explorer}/address/${address}`;
