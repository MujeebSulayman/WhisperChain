# Whispr Frontend

Whispr is a privacy-first messaging app where your wallet is your account, built on Base.

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in the RPC URL, Privy app ID, relayer key and `PINATA_JWT`.

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Open Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Connect your MetaMask wallet
   - Start messaging!

## Features

-  **Private Messaging** - Only the people in a conversation can read it
-  **Pay-to-Message** - Send payments with messages (ETH or ERC20)
-  **File Sharing** - Upload images, videos, audio, documents
-  **Group Conversations** - Multi-participant conversations
-  **Storage Management** - Track and manage your storage usage
-  **Batch Messaging** - Send multiple messages at once
-  **Modern UI** - Beautiful, responsive design with animations

## IPFS Setup

See [IPFS_SETUP.md](./IPFS_SETUP.md) for detailed IPFS configuration options.

**Quick Setup (No API Keys):**

- Works out of the box with public gateways
- Good for development/testing

**Production Setup (Recommended):**

- Use Pinata for reliable file pinning
- Get free API keys at [pinata.cloud](https://www.pinata.cloud/)

## Environment Variables

```env
# IPFS (Optional - works without these)
NEXT_PUBLIC_PINATA_API_KEY=your_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_secret
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Blockchain 
NEXT_PUBLIC_SCARF_ADDRESS=
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
```

## Project Structure

```
Frontend/
├── app/                 # Next.js app directory
├── components/          # React components
├── lib/                 # Utilities (blockchain, IPFS)
├── hooks/               # Custom React hooks
├── typechain/           # Generated contract types
└── blockchain/          # Contract ABI
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run typechain` - Regenerate contract types



## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Ethers.js v6** - Blockchain interactions
- **TypeChain** - Contract type generation
- **Tailwind CSS** - Styling
- **IPFS** - Decentralized storage
- **Base Chain** - Ethereum L2

