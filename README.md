# Gated NFT — ERC1155 Access Gate

A full-stack Web3 application that gates access to a page based on ERC1155 NFT ownership. Users connect their MetaMask wallet, sign a message, and the server verifies on-chain whether they hold the required token. If they do, they're granted access. If they disconnect their wallet, they're redirected to an exit page.

---

## How It Works

1. User visits the frontend and connects their MetaMask wallet
2. User clicks "Check Access" and signs a message
3. The server verifies the signature and checks the NFT balance on Sepolia
4. If the wallet holds token ID 0, access is granted and a popup appears
5. User clicks through to the dashboard
6. If the wallet disconnects at any point, the user is redirected to the exit page

---

## Project Structure

```
Gated-NFT/
├── contracts/
│   └── NFT.sol              # ERC1155 contract with mint and mintBatch
├── frontend/
│   └── app/
│       ├── page.tsx         # Main gate page (connect + verify)
│       ├── dashboard/
│       │   └── page.tsx     # Page shown after access is granted
│       └── exit/
│           └── page.tsx     # Page shown after wallet disconnect
├── scripts/
│   ├── deploy.js            # Deploys NFT contract to Sepolia
│   └── mint.js              # Mints token ID 0 to a specified address
├── Server.js                # Express server — signature verification + NFT balance check
├── hardhat.config.js        # Hardhat config for Sepolia
└── .env                     # Environment variables (not committed)
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Smart Contract | Solidity 0.8.20, ERC1155, OpenZeppelin |
| Contract Tooling | Hardhat, ethers.js |
| Frontend | Next.js 16, React 19, TypeScript |
| Wallet | MetaMask via ethers.js BrowserProvider |
| Backend | Node.js, Express, ethers.js |
| Network | Sepolia Testnet |

---

## Prerequisites

- Node.js v18+
- MetaMask browser extension
- An Alchemy account (for Sepolia RPC)
- Sepolia testnet ETH (free from [sepoliafaucet.com](https://sepoliafaucet.com))

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/MashiyaL/Gated-NFT.git
cd Gated-NFT
```

### 2. Install root dependencies (server + Hardhat)

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend && npm install && cd ..
```

### 4. Create your `.env` file at the project root

```bash
cp .env.sepolia .env
```

Then edit `.env` and fill in your values:

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

---

## Deploy the Contract

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Copy the printed contract address and update `Server.js`:

```js
const CONTRACT_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

---

## Mint an NFT

```bash
npx hardhat run scripts/mint.js --network sepolia
```

This mints token ID 0 to the address set in `scripts/mint.js`. Edit the address in that file before running.

---

## Run Locally

In one terminal, start the server:

```bash
node Server.js
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Used By | Description |
|---|---|---|
| `SEPOLIA_RPC_URL` | Server.js, Hardhat | Alchemy or Infura Sepolia HTTP endpoint |
| `DEPLOYER_PRIVATE_KEY` | Hardhat only | Wallet that owns the contract (for deploy + mint) |

---

## Contract Details

- **Standard:** ERC1155
- **Network:** Sepolia Testnet
- **Access control:** `onlyOwner` on `mint()` and `mintBatch()`
- **Token ID checked:** `0`
- **Functions:** `mint(address)`, `mintBatch(address, ids[], amounts[])`, `setBaseURI(string)`

---

## License

MIT
