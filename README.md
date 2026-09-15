# Stellar Payment UI

Drop-in React components for Stellar payments — balance display, a send form, a receive QR code, and transaction history. Built for web apps (plain React), not React Native.

## Why this exists

Every team building a payments UI on Stellar ends up writing the same handful of things: a balance widget, a send-XLM form, a QR code for receiving, a transaction list. There's no small, unopinionated component library that just does this and gets out of your way — so most projects rebuild it from scratch. This fills that gap: four components, wallet-agnostic (works with Freighter out of the box, or wire up any wallet via the `signTransaction` prop), styled minimally so they're easy to restyle.

This is UI/dev tooling, not a competing wallet or app — it's meant to be dropped into other people's projects.

## Components

| Component | What it does |
|---|---|
| `<Balance publicKey pollMs?>` | Shows native XLM balance, optionally polling |
| `<ReceiveQR publicKey size?>` | QR code of the address + copy-to-clipboard |
| `<SendPayment sourcePublicKey signTransaction onSuccess? onError?>` | Full send form: builds, signs, and submits a payment |
| `<TransactionHistory publicKey limit?>` | Recent payments list (incoming + outgoing) |

Plus two hooks you can use standalone:

- `useStellarAccount(publicKey, { pollMs })` — balances/account state
- `useFreighter()` — connect/disconnect/sign via the Freighter browser wallet

## Install (once published)

```bash
npm install stellar-payment-ui @stellar/stellar-sdk @stellar/freighter-api qrcode.react
```

```jsx
import { Balance, SendPayment, ReceiveQR, TransactionHistory, useFreighter } from "stellar-payment-ui";
import "stellar-payment-ui/style.css";
```

## Local development

```bash
npm install                 # library deps
npm run build                # builds dist/ (library mode via Vite)

cd demo
npm install                  # demo app deps
npm run dev                  # demo at http://localhost:5173, aliased to library source
```

The demo (`demo/`) wires all four components together behind a "Connect Freighter" button, running against Stellar Testnet.

## Network

Defaults to Testnet. To point at a different network/Horizon instance:

```js
import { configureNetwork } from "stellar-payment-ui";
import { Networks } from "@stellar/stellar-sdk";

configureNetwork({ horizonUrl: "https://horizon.stellar.org", passphrase: Networks.PUBLIC });
```

## Status

Core components are implemented and render-tested. See `ISSUES.md` for the remaining scoped work — mostly polish, additional wallets, and hardening — sized for multiple contributors to pick up independently.

## License

MIT
