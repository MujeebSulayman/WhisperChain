import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WhisperChainModule = buildModule("WhisperChainModule", (m) => {
  const forwarder = m.contract("Forwarder");
  const whisperChain = m.contract("WhisperChain", [forwarder]);
  const paymaster = m.contract("WhisperChainPaymaster", [forwarder]);

  return { forwarder, whisperChain, paymaster };
});

export default WhisperChainModule;