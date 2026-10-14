import type { ReactNode } from "react";
import { A, C, Callout, Cards, Code, H2, H3, List, P, Steps, Table } from "@/components/docs/Blocks";
import { BASE_CHAIN, FORWARDER_ADDRESS, PAYMASTER_ADDRESS, SCARF_ADDRESS } from "./deployments";
import { APP_URL, explorerAddress } from "./links";

export type DocPage = {
  slug: string; // "" is the docs home
  group: string;
  title: string;
  description: string;
  /** Sections for the "On this page" list; ids match the H2s in the body. */
  toc: { id: string; label: string }[];
  body: () => ReactNode;
};

export const DOC_GROUPS = ["Getting started", "Using the app", "How it works", "Developers"] as const;

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const Addr = ({ a }: { a: string }) => <A href={explorerAddress(a)}>{short(a)}</A>;

const ENV_FRONTEND = `# Base Sepolia RPC, used for reads and by the relayer
NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org

# Relayer (server only, never prefix with NEXT_PUBLIC_)
RELAYER_PRIVATE_KEY=0xYourRelayerKey
RELAYER_REIMBURSEMENT_WEI=50000000000000

# IPFS uploads through Pinata
NEXT_PUBLIC_PINATA_API_KEY=yourPinataKey
NEXT_PUBLIC_PINATA_SECRET_KEY=yourPinataSecret
NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs

# Optional: only to use your own contracts
# NEXT_PUBLIC_SCARF_ADDRESS=0x…
# NEXT_PUBLIC_FORWARDER_ADDRESS=0x…
# NEXT_PUBLIC_PAYMASTER_ADDRESS=0x…`;

const ENV_CONTRACT = `PRIVATE_KEY=your_deployer_private_key
SEPOLIA_BASE_URL=https://sepolia.base.org
ETHERSCAN_API_KEY=your_etherscan_key`;

const RELAY_REQUEST = `POST /api/relay
Content-Type: application/json

{
  "request": {
    "from": "0xYourAddress",
    "to": "${short(SCARF_ADDRESS)} (Scarf)",
    "value": "0",
    "gas": "214000",
    "nonce": "7",
    "data": "0x…encoded sendMessage(…)"
  },
  "signature": "0x…EIP-712 signature"
}`;

export const DOCS: DocPage[] = [
  /* ── Getting started ──────────────────────────────────────── */
  {
    slug: "",
    group: "Getting started",
    title: "Introduction",
    description: "Scarf is a messaging app where your wallet is your account. Here is what it does and how these docs are organised.",
    toc: [
      { id: "what", label: "What Scarf is" },
      { id: "features", label: "What you can do" },
      { id: "next", label: "Where to go next" },
    ],
    body: () => (
      <>
        <H2 id="what">What Scarf is</H2>
        <P>
          Scarf is a chat app built on {BASE_CHAIN.name}. Instead of an email and password, you connect a wallet. Every
          message, file and payment you send is recorded by a smart contract, and you sign each one in your wallet.
        </P>
        <P>
          You don&apos;t need ETH to chat. Your wallet signs a request, the app&apos;s relayer submits it, and a paymaster contract covers
          the gas.
        </P>
        <H2 id="features">What you can do</H2>
        <List
          items={[
            "Chat one-to-one with any registered wallet.",
            "Start group conversations with several people.",
            "Share images, video, audio and documents up to 50 MB each.",
            "Send one message to up to 10 people with a single signature.",
            "Attach ETH or any ERC-20 token to a message.",
            "Pick a username that lives on-chain with your address.",
          ]}
        />
        <H2 id="next">Where to go next</H2>
        <Cards
          items={[
            { href: "/docs/quickstart", title: "Quickstart", body: "Connect a wallet, pick a username and send your first message." },
            { href: "/docs/conversations", title: "Using the app", body: "Chats, groups, media, batch send and payments." },
            { href: "/docs/gasless", title: "How it works", body: "Signatures, the relayer, the paymaster and the contracts." },
            { href: "/docs/run-locally", title: "Developers", body: "Run the app, deploy the contracts and call the relayer." },
          ]}
        />
      </>
    ),
  },
  {
    slug: "quickstart",
    group: "Getting started",
    title: "Quickstart",
    description: "From zero to your first message in a few minutes.",
    toc: [
      { id: "need", label: "What you need" },
      { id: "steps", label: "Send your first message" },
      { id: "trouble", label: "If something goes wrong" },
    ],
    body: () => (
      <>
        <H2 id="need">What you need</H2>
        <List
          items={[
            <>A browser wallet such as MetaMask. On a phone, open the app inside the MetaMask browser.</>,
            <>
              The {BASE_CHAIN.name} network (chain ID {BASE_CHAIN.id}) in your wallet.
            </>,
            "The wallet address of someone who has also registered, to chat with.",
          ]}
        />
        <Callout title="No ETH required">Sending is gasless. You only sign requests; you never pay a network fee to chat.</Callout>

        <H2 id="steps">Send your first message</H2>
        <Steps
          items={[
            { title: "Open the app", body: <>Go to <A href={APP_URL}>the app</A> and press <C>Connect wallet</C> in the left panel.</> },
            {
              title: "Register a username",
              body: "The first time you connect, choose a username and sign. It is saved on-chain with your address, and a unique public key is generated for you.",
            },
            { title: "Start a conversation", body: <>Press <C>New conversation</C> and paste the other person&apos;s wallet address.</> },
            { title: "Say hello", body: "Type a message and press Send, then approve the signature request in your wallet." },
          ]}
        />

        <H2 id="trouble">If something goes wrong</H2>
        <Table
          head={["Message", "What it means"]}
          rows={[
            ["Recipient not registered", "The address you messaged hasn't registered a username yet. Ask them to open the app and register."],
            ["Relayer not configured", "The app's relayer key isn't set, so it can't submit your message. See Run locally."],
            ["Request cancelled", "You rejected the signature in your wallet. Nothing was sent."],
          ]}
        />
      </>
    ),
  },

  /* ── Using the app ────────────────────────────────────────── */
  {
    slug: "conversations",
    group: "Using the app",
    title: "Chats and groups",
    description: "Direct messages, group conversations and your inbox.",
    toc: [
      { id: "direct", label: "Direct messages" },
      { id: "groups", label: "Group conversations" },
      { id: "inbox", label: "Your inbox" },
    ],
    body: () => (
      <>
        <H2 id="direct">Direct messages</H2>
        <P>
          Press <C>New conversation</C>, add one wallet address and confirm. If you already have a chat with that address, the app
          opens it instead of creating a new one. Both people must be registered.
        </P>
        <H2 id="groups">Group conversations</H2>
        <P>
          Add two or more addresses to start a group. The contract records the conversation with every participant, and it shows up
          in each member&apos;s inbox.
        </P>
        <Callout tone="warn" title="Current limitation">
          Messages in a group are currently addressed to the first other member only, so the rest of the group won&apos;t receive them.
          Use <A href="/docs/batch-send">batch send</A> to reach several people until group delivery is fixed.
        </Callout>
        <H2 id="inbox">Your inbox</H2>
        <List
          items={[
            "Conversations are sorted by their latest message.",
            "Search filters by address or by the text of the latest message.",
            "New messages appear when the contract emits them, and the open chat also refreshes every 10 seconds.",
            "Messages sent within five minutes of each other from the same person are grouped together.",
          ]}
        />
      </>
    ),
  },
  {
    slug: "media",
    group: "Using the app",
    title: "Photos, video and files",
    description: "What you can share, the size limits and where files are stored.",
    toc: [
      { id: "types", label: "What you can share" },
      { id: "send", label: "Sending a file" },
      { id: "storage", label: "Where files live" },
    ],
    body: () => (
      <>
        <H2 id="types">What you can share</H2>
        <Table
          head={["Type", "Formats", "Shown as"]}
          rows={[
            ["Image", "Any image/* file", "An inline preview; tap to open full size"],
            ["Video", "Any video/* file", "A file card that opens the video"],
            ["Audio", "Any audio/* file", "A file card that opens the audio"],
            ["Document", ".pdf, .doc, .docx, .txt", "A file card with size and IPFS link"],
          ]}
        />
        <H2 id="send">Sending a file</H2>
        <Steps
          items={[
            { title: "Attach", body: "Press the paperclip in the composer and pick a file, up to 50 MB." },
            { title: "Add a caption (optional)", body: "Type a message to go with it." },
            { title: "Send", body: "The file uploads to IPFS first, then you sign the message that records it." },
          ]}
        />
        <H2 id="storage">Where files live</H2>
        <P>
          Files are pinned to IPFS through Pinata. The contract stores each file&apos;s IPFS hash, type and size, and refuses a hash that
          was already used, so the same file can&apos;t be sent twice.
        </P>
        <Callout tone="warn" title="Files are public">
          Anyone with a file&apos;s IPFS link can open it, and the link is readable on-chain. Don&apos;t share anything private.
        </Callout>
      </>
    ),
  },
  {
    slug: "batch-send",
    group: "Using the app",
    title: "Batch send",
    description: "Send one message to up to ten people with a single signature.",
    toc: [
      { id: "how", label: "How to batch send" },
      { id: "rules", label: "Rules" },
    ],
    body: () => (
      <>
        <H2 id="how">How to batch send</H2>
        <Steps
          items={[
            { title: "Open Batch send", body: "It's in the left panel of the app." },
            { title: "Add recipients", body: "Add up to 10 wallet addresses. Each must be registered." },
            { title: "Write and send", body: "Write the message once and sign once. Each recipient gets their own copy in your chat with them." },
          ]}
        />
        <H2 id="rules">Rules</H2>
        <List
          items={[
            <>The contract rejects batches of more than 10 (<C>Too many messages in batch</C>).</>,
            "You can't include your own address.",
            "Every recipient must be registered, or the whole batch fails.",
          ]}
        />
      </>
    ),
  },
  {
    slug: "payments",
    group: "Using the app",
    title: "Payments in chat",
    description: "Attach ETH or any ERC-20 token to a message.",
    toc: [
      { id: "eth", label: "Sending ETH" },
      { id: "tokens", label: "Sending tokens" },
      { id: "history", label: "Payment history" },
    ],
    body: () => (
      <>
        <H2 id="eth">Sending ETH</H2>
        <P>
          Press the coin icon in the composer, enter an amount and send your message. The contract transfers the ETH straight to the
          recipient in the same transaction and emits <C>PaymentSettled</C>. There is nothing to claim later.
        </P>
        <Callout title="Payments need funds">
          Messages are gasless, but a payment is real money: the ETH or tokens you attach come from your wallet.
        </Callout>
        <H2 id="tokens">Sending tokens</H2>
        <Steps
          items={[
            { title: "Choose the token", body: "Switch to token mode and paste the ERC-20 contract address." },
            { title: "Approve once", body: "Approve Scarf to spend that amount. The app checks your allowance and asks only when needed." },
            { title: "Send", body: "The contract moves the tokens from you to the recipient with transferFrom." },
          ]}
        />
        <H2 id="history">Payment history</H2>
        <P>
          <C>Payment history</C> in the left panel lists the payments you have sent and received, with filters for each direction.
        </P>
      </>
    ),
  },
  {
    slug: "profile",
    group: "Using the app",
    title: "Profile and storage",
    description: "Your username, your public key, and how storage is counted.",
    toc: [
      { id: "username", label: "Username" },
      { id: "key", label: "Public key" },
      { id: "storage", label: "Storage and activity" },
    ],
    body: () => (
      <>
        <H2 id="username">Username</H2>
        <P>
          You pick a username when you register. It is stored in the contract with your address and shown to people you chat with.
        </P>
        <H2 id="key">Public key</H2>
        <P>
          Registration also stores a public key for your profile. You can replace it under <C>Settings</C>, which signs an{" "}
          <C>updatePublicKey</C> request.
        </P>
        <H2 id="storage">Storage and activity</H2>
        <List
          items={[
            "Each user has 1 GB of media storage, counted from the sizes of the files you send.",
            "The left panel shows your message count and storage used.",
            "Each account can send up to 10,000 messages.",
          ]}
        />
      </>
    ),
  },

  /* ── How it works ─────────────────────────────────────────── */
  {
    slug: "gasless",
    group: "How it works",
    title: "Gasless messaging",
    description: "How a message gets on-chain without you paying gas.",
    toc: [
      { id: "flow", label: "The flow" },
      { id: "request", label: "The signed request" },
      { id: "gas", label: "Who pays" },
    ],
    body: () => (
      <>
        <H2 id="flow">The flow</H2>
        <Steps
          items={[
            { title: "You sign", body: <>Your wallet signs an EIP-712 <C>ForwardRequest</C> describing the exact contract call.</> },
            { title: "The app relays", body: <>The app posts the request and signature to its relayer at <C>/api/relay</C>.</> },
            { title: "The Paymaster submits", body: <>The relayer calls <C>Paymaster.relay()</C>, which runs the request through the Forwarder.</> },
            { title: "The Forwarder checks", body: "It verifies your signature and nonce, then calls Scarf with your address attached." },
            { title: "Scarf records it", body: <>It reads you as the sender (ERC-2771), stores the message and emits <C>MessageSent</C>.</> },
          ]}
        />
        <H2 id="request">The signed request</H2>
        <Table
          head={["Field", "Meaning"]}
          rows={[
            [<C key="f">from</C>, "Your address."],
            [<C key="t">to</C>, "The Scarf contract."],
            [<C key="v">value</C>, "ETH sent with the call (for ETH payments)."],
            [<C key="g">gas</C>, "Gas limit: an estimate plus 80,000."],
            [<C key="n">nonce</C>, "Your next Forwarder nonce. A request can only run once."],
            [<C key="d">data</C>, "The encoded call, such as sendMessage(…)."],
          ]}
        />
        <P>
          Because the signature covers every field, a relayer can&apos;t change the message, the recipient or the amount, and can&apos;t
          replay it.
        </P>
        <H2 id="gas">Who pays</H2>
        <P>
          The relayer pays the gas, and the Paymaster refunds it a fixed amount per message from its own balance:{" "}
          <C>RELAYER_REIMBURSEMENT_WEI</C> (0.00005 ETH by default), capped by the Paymaster&apos;s <C>maxReimbursementPerTx</C> (0.01 ETH
          by default). Anyone can top up the Paymaster with <C>deposit()</C> or a plain transfer.
        </P>
      </>
    ),
  },
  {
    slug: "contracts",
    group: "How it works",
    title: "Smart contracts",
    description: `The three contracts behind Scarf on ${BASE_CHAIN.name}.`,
    toc: [
      { id: "addresses", label: "Addresses" },
      { id: "scarf", label: "Scarf" },
      { id: "forwarder", label: "Forwarder" },
      { id: "paymaster", label: "Paymaster" },
    ],
    body: () => (
      <>
        <H2 id="addresses">Addresses</H2>
        <Table
          head={["Contract", "Address", "Role"]}
          rows={[
            ["Scarf", <Addr key="w" a={SCARF_ADDRESS} />, "Profiles, conversations, messages, media, payments"],
            ["Forwarder", <Addr key="f" a={FORWARDER_ADDRESS} />, "Verifies signed requests (ERC-2771)"],
            ["ScarfPaymaster", <Addr key="p" a={PAYMASTER_ADDRESS} />, "Relays requests and refunds the relayer"],
          ]}
        />
        <P>
          Chain ID {BASE_CHAIN.id}. Built with Solidity 0.8.28 and OpenZeppelin, deployed with Hardhat Ignition.
        </P>
        <H2 id="scarf">Scarf</H2>
        <H3>Main functions</H3>
        <Table
          head={["Function", "What it does"]}
          rows={[
            [<C key="1">registerUser(publicKey, username)</C>, "Creates your profile."],
            [<C key="2">createConversation(participants, keyHash)</C>, "Creates a conversation with 2+ registered participants."],
            [<C key="3">sendMessage(recipient, hash, token, amount, ipfsHash, mediaType, size, text)</C>, "Sends a message, file and/or payment."],
            [<C key="4">sendBatchMessages(…)</C>, "Sends up to 10 messages in one call."],
            [<C key="5">deleteMessage(messageId)</C>, "Marks a message deleted (sender or recipient only)."],
            [<C key="6">updatePublicKey(newKey)</C>, "Replaces your profile's public key."],
          ]}
        />
        <H3>Events</H3>
        <P>
          <C>UserRegistered</C>, <C>ConversationCreated</C>, <C>MessageSent</C>, <C>BatchMessageSent</C>, <C>MediaUploaded</C>,{" "}
          <C>PaymentSettled</C>, <C>MessageDeleted</C>.
        </P>
        <H3>Limits</H3>
        <Table
          head={["Constant", "Value"]}
          rows={[
            [<C key="a">MAX_FILE_SIZE</C>, "50,000,000 bytes (50 MB)"],
            [<C key="b">MAX_STORAGE_PER_USER</C>, "1,000,000,000 bytes (1 GB)"],
            [<C key="c">MAX_MESSAGES_PER_USER</C>, "10,000"],
            ["Batch size", "10 recipients"],
          ]}
        />
        <H2 id="forwarder">Forwarder</H2>
        <P>
          OpenZeppelin&apos;s <C>MinimalForwarder</C>. It checks the EIP-712 signature and nonce of a <C>ForwardRequest</C>, then calls
          the target with the signer&apos;s address appended, which Scarf reads as the sender.
        </P>
        <H2 id="paymaster">Paymaster</H2>
        <P>
          Holds ETH and exposes <C>relay(req, signature, relayer, reimbursement)</C>: it executes the request through the Forwarder,
          then pays the relayer the reimbursement, up to <C>maxReimbursementPerTx</C>. The owner can change that cap and withdraw.
        </P>
      </>
    ),
  },
  {
    slug: "security",
    group: "How it works",
    title: "Privacy and security",
    description: "What is public, what the contracts guarantee, and the known limitations.",
    toc: [
      { id: "public", label: "What is public" },
      { id: "guarantees", label: "What is guaranteed" },
      { id: "limits", label: "Known limitations" },
    ],
    body: () => (
      <>
        <H2 id="public">What is public</H2>
        <Callout tone="warn" title="Messages are not encrypted">
          Message text is stored in the contract on a public network, and files sit on IPFS. Anyone can read them. Don&apos;t send
          secrets, passwords or private documents.
        </Callout>
        <List
          items={[
            "Your address, username and public key.",
            "Who you message, when, and any payment amounts.",
            "The text of every message, and the IPFS links of every file.",
          ]}
        />
        <H2 id="guarantees">What is guaranteed</H2>
        <List
          items={[
            "Only your signature can send a message as you. A relayer can't forge, change or replay it.",
            "Payments move in the same transaction as the message, straight to the recipient.",
            "Sends are protected by a reentrancy guard and can be paused by the owner in an emergency.",
          ]}
        />
        <H2 id="limits">Known limitations</H2>
        <List
          items={[
            "Group messages are delivered to the first other member only (see Chats and groups).",
            "Deleting a message isn't available in the app yet, and on-chain history can never be erased.",
            <>
              <C>clearStorage()</C> resets your storage counter without removing files, so the 1 GB limit can be reset by the user.
            </>,
            <>
              Anyone can call <C>Paymaster.relay()</C> with their own signed requests and claim up to <C>maxReimbursementPerTx</C> each
              time. Keep the Paymaster balance and the cap small.
            </>,
            <>
              Pinata keys use the <C>NEXT_PUBLIC_</C> prefix, so they are visible in the browser. Use a scoped key that can only pin
              files.
            </>,
          ]}
        />
      </>
    ),
  },

  /* ── Developers ───────────────────────────────────────────── */
  {
    slug: "run-locally",
    group: "Developers",
    title: "Run the app locally",
    description: "Install the frontend, configure it and start the dev server.",
    toc: [
      { id: "install", label: "Install" },
      { id: "env", label: "Environment variables" },
      { id: "start", label: "Start" },
    ],
    body: () => (
      <>
        <H2 id="install">Install</H2>
        <Code label="Terminal">{`cd Frontend\nnpm install`}</Code>
        <H2 id="env">Environment variables</H2>
        <P>
          Copy the template, then fill in your keys:
        </P>
        <Code label="Terminal">{"cp .env.example .env.local"}</Code>
        <Code label=".env.local">{ENV_FRONTEND}</Code>
        <Callout tone="warn" title="Never leave a variable empty">
          Delete or comment out a line you don&apos;t use. An empty value such as <C>NEXT_PUBLIC_SCARF_ADDRESS=</C> overrides
          the built-in default with an empty string and breaks the app.
        </Callout>
        <Table
          head={["Variable", "Required", "Notes"]}
          rows={[
            [<C key="1">NEXT_PUBLIC_BASE_RPC</C>, "Yes", `A ${BASE_CHAIN.name} RPC URL.`],
            [<C key="2">RELAYER_PRIVATE_KEY</C>, "Yes", "The relayer wallet. Needs a little ETH for gas. Server-only."],
            [<C key="3">NEXT_PUBLIC_PINATA_API_KEY / _SECRET_KEY</C>, "For files", "Without them, text works but uploads fail."],
            [<C key="4">RELAYER_REIMBURSEMENT_WEI</C>, "No", "Refund per message. Defaults to 50000000000000 (0.00005 ETH)."],
            [<C key="5">NEXT_PUBLIC_*_ADDRESS</C>, "No", "Override the deployed contract addresses."],
            [<C key="6">NEXT_PUBLIC_RELAYER_API_URL</C>, "No", "Use an external relayer instead of /api/relay."],
            [<C key="7">NEXT_PUBLIC_IPFS_GATEWAY</C>, "No", "Defaults to the Pinata gateway."],
          ]}
        />
        <H2 id="start">Start</H2>
        <Code label="Terminal">{`npm run dev\n# http://localhost:3000`}</Code>
        <Callout title="Styles not updating?">
          If changes to <C>app/globals.css</C> don&apos;t show up, stop the dev server, delete <C>Frontend/.next</C> and run{" "}
          <C>npm run dev</C> again. File watching can miss changes in synced folders such as OneDrive.
        </Callout>
      </>
    ),
  },
  {
    slug: "deploy",
    group: "Developers",
    title: "Deploy the contracts",
    description: `Deploy your own Scarf, Forwarder and Paymaster to ${BASE_CHAIN.name}.`,
    toc: [
      { id: "setup", label: "Set up" },
      { id: "deploy", label: "Deploy and verify" },
      { id: "after", label: "After deploying" },
    ],
    body: () => (
      <>
        <H2 id="setup">Set up</H2>
        <Code label="Terminal">{`cd Contract\nnpm install`}</Code>
        <P>
          Create <C>Contract/.env</C>:
        </P>
        <Code label=".env">{ENV_CONTRACT}</Code>
        <H2 id="deploy">Deploy and verify</H2>
        <Code label="Terminal">{`npx hardhat compile
npx hardhat ignition deploy ./ignition/modules/Scarf.ts --network sepoliaBase
npx hardhat run scripts/verify.ts --network sepoliaBase`}</Code>
        <P>Ignition deploys in order: Forwarder, then Scarf and the Paymaster, both pointing at the Forwarder.</P>
        <H2 id="after">After deploying</H2>
        <Steps
          items={[
            {
              title: "Point the app at your contracts",
              body: (
                <>
                  Set <C>NEXT_PUBLIC_SCARF_ADDRESS</C>, <C>NEXT_PUBLIC_FORWARDER_ADDRESS</C> and{" "}
                  <C>NEXT_PUBLIC_PAYMASTER_ADDRESS</C> in <C>Frontend/.env.local</C>.
                </>
              ),
            },
            { title: "Fund the Paymaster", body: <>Send it ETH, or call <C>deposit()</C>. It pays relayer refunds from this balance.</> },
            { title: "Fund the relayer", body: <>The <C>RELAYER_PRIVATE_KEY</C> wallet pays gas up front, so give it some ETH.</> },
            { title: "Regenerate types (if the ABI changed)", body: <>Copy the new ABI into <C>Frontend/blockchain</C> and run <C>npm run typechain</C>.</> },
          ]}
        />
      </>
    ),
  },
  {
    slug: "relayer-api",
    group: "Developers",
    title: "Relayer API",
    description: "The endpoint the app uses to submit signed requests.",
    toc: [
      { id: "request", label: "Request" },
      { id: "response", label: "Response" },
      { id: "errors", label: "Errors" },
    ],
    body: () => (
      <>
        <H2 id="request">Request</H2>
        <P>
          The app signs a <C>ForwardRequest</C> in the browser and posts it here. All numbers are sent as strings.
        </P>
        <Code label="HTTP">{RELAY_REQUEST}</Code>
        <P>
          If <C>gas</C> is <C>&quot;0&quot;</C> or missing, the relayer estimates it and adds 80,000. With a Paymaster configured it
          calls <C>Paymaster.relay()</C>; otherwise it calls <C>Forwarder.execute()</C> directly and pays the gas itself.
        </P>
        <H2 id="response">Response</H2>
        <Code label="200 OK">{`{ "hash": "0x…transaction hash" }`}</Code>
        <P>The relayer waits for the transaction to be mined before responding.</P>
        <H2 id="errors">Errors</H2>
        <Table
          head={["Status", "Body", "Cause"]}
          rows={[
            ["400", <C key="1">Invalid JSON</C>, "The body isn't valid JSON."],
            ["400", <C key="2">Missing request or signature</C>, "from, to, data or the signature is missing."],
            ["503", <C key="3">Relayer not configured (RELAYER_PRIVATE_KEY)</C>, "The server has no relayer key."],
            ["503", <C key="4">Forwarder not configured</C>, "No Forwarder address is set."],
            ["500", "The error message", "The transaction reverted, for example a bad signature or an unregistered recipient."],
          ]}
        />
      </>
    ),
  },
];

export const docHref = (slug: string) => (slug ? `/docs/${slug}` : "/docs");

export function findDoc(slug: string) {
  return DOCS.find((d) => d.slug === slug);
}

export function neighbours(slug: string) {
  const i = DOCS.findIndex((d) => d.slug === slug);
  return { prev: i > 0 ? DOCS[i - 1] : undefined, next: i < DOCS.length - 1 ? DOCS[i + 1] : undefined };
}
