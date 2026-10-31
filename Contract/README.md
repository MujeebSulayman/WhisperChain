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

## Private payments (WhisprStealthPay)

A separate deployment that leaves Scarf, the Forwarder and the Scarf paymaster untouched:

```shell
npx hardhat ignition deploy ./ignition/modules/WhisprStealthPay.ts --network sepoliaBase \
  --parameters ignition/parameters/stealth-sepolia.json --deployment-id stealth-sepolia
```

- **WhisprStealthPay**: pays ETH or tokens to one-time stealth addresses (ERC-5564, scheme 1) and lets the recipient claim them. Token sends and claims use EIP-2612 permits through the Forwarder, so they're gasless.
- **StealthPaymaster**: a second `ScarfPaymaster` whose only target is WhisprStealthPay. Fund it like the Scarf paymaster.

The Frontend reads both addresses from `lib/deployments.ts`. Base Sepolia: WhisprStealthPay `0x05739F4a9BbE04496DD6C53790dC9eD7D52a02AC`, StealthPaymaster `0x7E6288FBC951159EEc485Cd028C185f09e81d4bd`.
