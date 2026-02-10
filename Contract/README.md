# WhisperChain Contract

Hardhat project for WhisperChain and gasless (paymaster + relayer) infrastructure.

## Deploy

```shell
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/WhisperChain.ts --network sepoliaBase
npx hardhat run scripts/verify.ts --network sepoliaBase
```

Deployment order (handled by Ignition): **Forwarder** → **WhisperChain**(forwarder) → **WhisperChainPaymaster**(forwarder).

After deploy, set in Frontend `.env`:
- `NEXT_PUBLIC_WHISPERCHAIN_ADDRESS`
- `NEXT_PUBLIC_FORWARDER_ADDRESS`
- `NEXT_PUBLIC_PAYMASTER_ADDRESS`

## Gasless (Paymaster + Relayer)

- **Forwarder** (ERC-2771): Accepts EIP-712 signed `ForwardRequest` and executes calls on WhisperChain with the signer as `_msgSender()`.
- **WhisperChain**: Uses `ERC2771Context`; when the caller is the trusted forwarder, the real sender is taken from calldata.
- **WhisperChainPaymaster**: Holds ETH; relayers call `relay(req, signature, relayerAddress, reimbursement)`. The paymaster runs the forward then reimburses the relayer (capped by `maxReimbursementPerTx`).

To fund gasless UX: send ETH to the Paymaster (`paymaster.deposit()` or direct transfer). Owner can set `setMaxReimbursementPerTx` and `withdraw`.
