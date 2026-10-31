# Whispr

Whispr is a privacy-first messaging app where your wallet is your account. Chat one-to-one or in groups, share photos, video and files that only the people in the conversation can open, and send a payment without leaving the thread.

There's no sign-up form and no company server holding your conversations. Your messages live on Base, readable only by the people you're talking to.

## What the project can do

- **Private messaging:** Text, images, video, audio and documents that only the people in the conversation can read.
- **Conversations:** One-to-one chats or group conversations with multiple participants.
- **Payments:** Attach ETH or USDC to a message; the recipient gets the payment when the message is sent.
- **Batch sending:** Send up to 10 messages in one transaction to save gas.
- **Wallet identity:** Your address is your account. Activating it sets up your private inbox with one free signature.
- **Storage and limits:** Each user has a storage quota for media; the contract enforces message and file-size limits.

You can use the app in two ways: send transactions yourself (you pay gas), or use **gasless** sending (you only sign; someone else submits and can pay gas for you).


## Gasless sending, relayer, and paymaster

**Gasless** means you don?t pay gas. You only sign a message in your wallet. No transaction is sent from your account, so no gas is charged to you.

**Relayer:** A relayer is the party that actually submits the transaction to the chain. It can be a backend service, a bot, or any funded wallet. When you choose gasless sending, you produce a signature; the relayer takes that signature and submits the transaction. The relayer pays the gas fee for that submission.

**Paymaster:** The paymaster is a contract that holds ETH and can reimburse relayers. When a relayer submits your gasless request, the paymaster can send the relayer a set amount of ETH to cover (or partly cover) the gas they spent. So in practice: you don?t pay gas, the relayer submits, and the paymaster can refund the relayer. The project operator funds the paymaster; users just sign.

**Forwarder:** Under the hood, gasless flows use a forwarder contract. It checks your signature and then runs the action (e.g. send a message) on your behalf, so the chain still sees the action as coming from you, not from the relayer.

Together, the **forwarder**, **relayer**, and **paymaster** make it possible for users to register, send messages, and use other features without paying gas, while the relayer gets reimbursed from the paymaster?s balance.
