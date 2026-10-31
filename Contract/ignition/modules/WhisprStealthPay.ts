import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys WhisprStealthPay (private payments) and a second ScarfPaymaster that pays only for it.
 * Reuses the existing Forwarder, so Scarf and its paymaster are untouched.
 * Parameters: the deployed forwarder and the relayer to approve, e.g. ignition/parameters/stealth-sepolia.json.
 */
const WhisprStealthPayModule = buildModule("WhisprStealthPayModule", (m) => {
  const forwarder = m.getParameter<string>("forwarder");
  const relayer = m.getParameter<string>("relayer");

  const stealthPay = m.contract("WhisprStealthPay", [forwarder]);
  const paymaster = m.contract("ScarfPaymaster", [forwarder, stealthPay], { id: "StealthPaymaster" });

  m.call(paymaster, "setRelayer", [relayer, true]);

  return { stealthPay, paymaster };
});

export default WhisprStealthPayModule;
