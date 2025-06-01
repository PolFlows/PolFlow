# Polkadot DeFi Flow Platform

_A node-based, no-code strategy builder for cross-chain automation in the Polkadot ecosystem._

![workflow builder screenshot](docs/screenshot-flow-builder.png)<!-- optional, remove if not yet available -->

---

## ✨ Why does this exist?

Decentralised finance on Polkadot spans dozens of parachains, each with its own DEXs, liquidity pools and yield farms.  
Manually transferring assets with XCM, comparing APYs or reacting to price movements is slow and error-prone.

This project lets anyone **drag, drop and connect strategy nodes** (wallets, price oracles, XCM transfers, DEX aggregators, liquidity pools, governance votes, alerts …) and run them automatically—no smart-contract coding required.

---

## 🏗 Architecture at a glance

| Layer | Description | Key packages |
|-------|-------------|--------------|
| **Frontend** | Next.js 14 + ReactFlow canvas renders the node editor, TailwindCSS powers styling. | `next`, `react`, `reactflow`, `tailwindcss` |
| **Polkadot integration** | Context providers wrap `@polkadot/api` for RPC, extension-dapp for wallet access and XCM helpers for cross-chain calls. | `@polkadot/api 10.11.2`, `@polkadot/extension-dapp 0.46.6` |
| **Workflow engine** | `@xyz-flow` (placeholder) stores, validates and executes node graphs. | `@xyz-flow` |
| **State management** | Lightweight global stores for theme, wallet, Polkadot API and flow state via React context + Zustand. | `zustand` |

---

## 🧩 Node catalogue

| Node | Purpose | Example config |
|------|---------|----------------|
| Wallet Connect | Connect Polkadot.js / Talisman / Nova / SubWallet | `selectedWallet: "Polkadot.js"` |
| Asset Selector | Choose chain, token, amount | `(Polkadot, DOT, 2.5)` |
| XCM Transfer | HRMP/VMP cross-chain asset moves | `xcmVersion: "v3"` |
| Conditional | IF / WHILE / DELAY logic gates | `if price > $1.01` |
| DEX Aggregator | Best-price swaps across HydraDX, StellaSwap, … | `slippageTolerance: 0.3 %` |
| Liquidity Pool | LP manage + impermanent-loss guard | `50/50 DOT-USDC, stake 30 d` |
| Yield Farm | Auto-compound yields on Acala, Parallel… | `minAPY: 8 %, risk: medium` |
| Oracle Feed | Subscan / OnFinality price feeds | `updateFrequency: 15 s` |
| Governance | Vote on OpenGov proposals | `proposalId: #12345` |
| Alert | Webhook / e-mail / Telegram triggers | `threshold: price move 5 %` |

Edges are colour-coded:  
Blue = **data**, Green = **assets**, Orange = **logic**, Purple = **cross-chain**.

---

## 🔖 Project structure (most relevant folders)

```
.
├── next.config.js           # Polyfills & WebAssembly opts for Polkadot.js
├── package.json             # Dependency versions
├── tsconfig.json
└── src
    ├── app/layout.tsx       # Global providers (theme, wallet, flow…)
    ├── components/FlowBuilder
    │   └── index.tsx        # Main drag-and-drop canvas
    ├── contexts
    │   ├── WalletContext.tsx
    │   ├── PolkadotContext.tsx
    │   └── FlowContext.tsx
    └── ...
```

---

## 🚀 Getting started

### Prerequisites

* **Node.js ≥ 18**
* **Git**
* A Polkadot wallet extension (Polkadot.js, Talisman, Nova or SubWallet)

### 1. Clone & install

```bash
git clone https://github.com/Gmin2/ink.git
cd ink
# switch to work branch if needed
git checkout droid/polkadot-defi-flow
npm install
```

### 2. Run dev server

```bash
npm run dev
# open http://localhost:3000
```

### 3. Connect a wallet

Click _“Wallet Connect”_ in the sidebar, choose your extension and approve the connection pop-up.

### 4. Build your first workflow

Drag nodes from the **Node Palette** → drop on canvas → connect with arrows.  
Hit **Save Workflow**; later load or execute it with one click.

---

## 🏗️ Production build

```bash
npm run build   # Next.js production build
npm start       # or deploy to Vercel, Netlify, Docker…
```

---

## 🔌 Environment variables (optional)

| Variable | Purpose | Default |
|----------|---------|---------|
| `NEXT_PUBLIC_RPC_POLKADOT` | Override relay-chain endpoint | `wss://rpc.polkadot.io` |
| `NEXT_PUBLIC_RPC_ACALA`   | … add as needed | |

Create a `.env.local` and restart `npm run dev`.

---

## ⚙️ Customization & extension

* Adjust **`NODE_TEMPLATES`** in `src/contexts/FlowContext.tsx` to add new parachains or node types.  
* Use **`typesBundle`/`typesChain`** in `PolkadotContext` to support custom runtimes.  
* Replace `@xyz-flow` with your own execution engine or backend.

---

## 🛡 Security considerations

This repo is **prototype code**. Before mainnet use:

* **Audit** XCM calls, slippage settings, fee estimations.
* Enable **multi-sig wallets** for high-value transfers.
* Rate-limit or sandbox untrusted oracle endpoints.

---

## 📜 License

MIT © 2025 Gmin2 & contributors  
Feel free to fork, improve and PR!

---

> _“Build once, orchestrate everywhere – welcome to cross-chain DeFi.”_
