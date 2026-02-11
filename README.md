# WhisperChain

Private messaging on the blockchain. Send encrypted messages and media, create group chats, and attach payments?without giving up control of your data.

WhisperChain lets you talk to others using your wallet as your identity. Messages are encrypted and stored in a decentralized way, so you're not dependent on a single company or server. You own the keys; the network routes and stores what you send.

---

## What the project can do

- **Messaging:** Send encrypted text and share files?images, video, audio, documents?stored in a decentralized way.
- **Conversations:** One-to-one chats or group conversations with multiple participants.
- **Payments:** Attach ETH or ERC 20 tokens to a message; the recipient gets the payment when the message is sent.
- **Batch sending:** Send up to 10 messages in one transaction to save gas.
- **Profiles:** Register with a public key and username, update your key, and manage your presence.
- **Storage and limits:** Each user has a storage quota for media; the contract enforces message and file-size limits.

You can use the app in two ways: send transactions yourself (you pay gas), or use **gasless** sending (you only sign; someone else submits and can pay gas for you).

---

## Gasless sending, relayer, and paymaster

**Gasless** means you don?t pay gas. You only sign a message in your wallet. No transaction is sent from your account, so no gas is charged to you.

**Relayer:** A relayer is the party that actually submits the transaction to the chain. It can be a backend service, a bot, or any funded wallet. When you choose gasless sending, you produce a signature; the relayer takes that signature and submits the transaction. The relayer pays the gas fee for that submission.

**Paymaster:** The paymaster is a contract that holds ETH and can reimburse relayers. When a relayer submits your gasless request, the paymaster can send the relayer a set amount of ETH to cover (or partly cover) the gas they spent. So in practice: you don?t pay gas, the relayer submits, and the paymaster can refund the relayer. The project operator funds the paymaster; users just sign.

**Forwarder:** Under the hood, gasless flows use a forwarder contract. It checks your signature and then runs the action (e.g. send a message) on your behalf, so the chain still sees the action as coming from you, not from the relayer.

Together, the **forwarder**, **relayer**, and **paymaster** make it possible for users to register, send messages, and use other features without paying gas, while the relayer gets reimbursed from the paymaster?s balance.
