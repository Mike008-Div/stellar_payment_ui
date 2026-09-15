# Stellar Payment UI

Drop-in React components for Stellar payments, with an optional Rust/Soroban escrow contract for programmable payment workflows. The UI package is built for web apps using React, not React Native.

## Why this exists

Every team building a payments UI on Stellar ends up writing the same handful of things: a balance widget, a send-XLM form, a QR code for receiving, a transaction list. There's no small, unopinionated component library that just does this and gets out of your way — so most projects rebuild it from scratch. This fills that gap: four components, wallet-agnostic (works with Freighter out of the box, or wire up any wallet via the `signTransaction` prop), styled minimally so they're easy to restyle.

This is UI and smart-contract tooling, not a competing wallet or app. The React package is meant to be dropped into other projects, while the contract is deployed separately to Stellar.

## Architecture

- **React and JavaScript** handle wallet connection, Horizon reads, direct XLM payments, QR codes, and transaction history.
- **Rust and Soroban** handle optional programmable escrow rules: funding, payer-authorized release, and deadline-based refunds.
- **Freighter** signs both the existing classic Stellar transactions and Soroban transactions when a consumer adds contract invocation code.

Simple wallet-to-wallet XLM transfers should use `SendPayment` directly. Use the escrow contract when a payment needs an on-chain rule or delayed settlement.

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
npm install                 # JavaScript and React dependencies
npm run build                # build the React library
npm run contract:format     # check Rust formatting
npm run contract:test       # run Soroban contract tests

cd demo
npm install                  # demo app deps
npm run dev                  # demo at http://localhost:5173, aliased to library source
```

To build the contract WASM, install the target once and run `npm run contract:build`:

```bash
rustup target add wasm32-unknown-unknown
npm run contract:build
```

The project requires Rust and Cargo for the Soroban workspace. The Stellar CLI is additionally required to deploy or invoke the contract; see [contracts/escrow/README.md](contracts/escrow/README.md).

The demo (`demo/`) wires all four UI components together behind a "Connect Freighter" button, running against Stellar Testnet. It demonstrates direct payments; the escrow contract is deployed and integrated separately because it requires a contract ID and token configuration.

## Network

Defaults to Testnet. To point at a different network/Horizon instance:

```js
import { configureNetwork } from "stellar-payment-ui";
import { Networks } from "@stellar/stellar-sdk";

configureNetwork({ horizonUrl: "https://horizon.stellar.org", passphrase: Networks.PUBLIC });
```

## Soroban contract

The library also includes an optional Soroban escrow contract under `contracts/escrow`. Use it when a payment needs programmable rules such as delayed release or refunds. The regular `SendPayment` component intentionally remains a direct Horizon payment because a simple wallet-to-wallet XLM transfer does not need a smart contract.

The escrow contract exposes four lifecycle methods:

- `create` stores the payer, payee, token contract, amount, and release deadline.
- `fund` moves the payer's tokens into the contract.
- `release` sends funded tokens to the payee after payer authorization.
- `refund` returns funded tokens to the payer once the deadline has passed.

See [contracts/escrow/README.md](contracts/escrow/README.md) for the contract lifecycle, build commands, and Testnet deployment outline.

## Status

The React components and the initial Rust/Soroban escrow contract are implemented. The UI build, demo build, Rust formatting, and contract source checks are part of the local workflow. Contract execution tests and a frontend escrow adapter remain tracked in `ISSUES.md`.

## License

MIT
