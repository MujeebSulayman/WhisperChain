import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WhisperChainModule = buildModule("WhisperChainModule", (m) => {
  const whisperChain = m.contract("WhisperChain");
  
  return { whisperChain };
});

export default WhisperChainModule;