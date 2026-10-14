import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys Forwarder -> WhisperChain -> WhisperChainPaymaster and approves the relayer.
 * Pass the relayer's address with a parameters file, e.g. ignition/parameters/base.json.
 */
const WhisperChainModule = buildModule("WhisperChainModule", (m) => {
  const relayer = m.getParameter<string>("relayer");

  const forwarder = m.contract("Forwarder");
  const whisperChain = m.contract("WhisperChain", [forwarder]);
  const paymaster = m.contract("WhisperChainPaymaster", [forwarder, whisperChain]);

  m.call(paymaster, "setRelayer", [relayer, true]);

  return { forwarder, whisperChain, paymaster };
});

export default WhisperChainModule;
