import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys ScarfForwarder -> Scarf -> ScarfPaymaster and approves the relayer.
 * Pass the relayer's address with a parameters file, e.g. ignition/parameters/base.json.
 */
const ScarfModule = buildModule("ScarfModule", (m) => {
  const relayer = m.getParameter<string>("relayer");

  const forwarder = m.contract("ScarfForwarder");
  const scarf = m.contract("Scarf", [forwarder]);
  const paymaster = m.contract("ScarfPaymaster", [forwarder, scarf]);

  m.call(paymaster, "setRelayer", [relayer, true]);

  return { forwarder, scarf, paymaster };
});

export default ScarfModule;
