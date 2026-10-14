# Scarf Contract

Hardhat project for Scarf and gasless (paymaster + relayer) infrastructure.

## Deploy

```shell
npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/Scarf.ts --network sepoliaBase
npx hardhat run scripts/verify.ts --network sepoliaBase
```

Deployment order (handled by Ignition): **Forwarder** → **Scarf**(forwarder) → **ScarfPaymaster**(forwarder).

After deploy, set in Frontend `.env`:
- `NEXT_PUBLIC_SCARF_ADDRESS`
- `NEXT_PUBLIC_FORWARDER_ADDRESS`
- `NEXT_PUBLIC_PAYMASTER_ADDRESS`

## Gasless (Paymaster + Relayer)

- **Forwarder** (ERC-2771): Accepts EIP-712 signed `ForwardRequest` and executes calls on Scarf with the signer as `_msgSender()`.
- **Scarf**: Uses `ERC2771Context`; when the caller is the trusted forwarder, the real sender is taken from calldata.
- **ScarfPaymaster**: Holds ETH; relayers call `relay(req, signature, relayerAddress, reimbursement)`. The paymaster runs the forward then reimburses the relayer (capped by `maxReimbursementPerTx`).

To fund gasless UX: send ETH to the Paymaster (`paymaster.deposit()` or direct transfer). Owner can set `setMaxReimbursementPerTx` and `withdraw`.
