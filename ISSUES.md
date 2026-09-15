# Issues / Roadmap

The React components and hooks are implemented, and the optional Rust/Soroban escrow contract is available under `contracts/escrow`. The UI package handles direct payments and Horizon data; the contract handles programmable escrow rules. The tasks below are the remaining work — each is independent, so several contributors can pick up different ones in parallel.

### Soroban follow-up

**#12 — Add a React escrow adapter**
Add a wallet-agnostic helper that builds and signs Soroban contract invocation transactions for the deployed escrow contract. Keep it separate from `SendPayment`, because direct classic payments and contract calls have different transaction-building and simulation requirements.

**#13 — Add Soroban integration tests**
Run the escrow contract against a local Stellar environment or Testnet and cover funding, release, refund deadlines, authorization failures, and invalid state transitions.

**#14 — Add an escrow workflow to the demo frontend**
Add a separate React panel for creating, funding, releasing, and refunding an escrow. It should accept a deployed contract ID and token contract ID from configuration, simulate Soroban transactions before signing, show the current escrow status, and keep `SendPayment` unchanged for direct XLM transfers.

### Good first issues

**#1 — Verify `useFreighter` against the current `@stellar/freighter-api`**
The hook's method names (`isConnected`, `requestAccess`, `signTransaction`) were written against a recent API shape, but the package has changed its surface across versions before. Pin a version, verify each call against its actual docs/types, and fix any mismatches.

**#2 — Asset selector for `SendPayment` (currently native XLM only)**
Add an `asset` prop (or a dropdown) so `SendPayment` can send any asset the source account trusts, not just native XLM. Requires building the `Asset` object from an asset code + issuer instead of `Asset.native()`.

**#3 — Loading skeletons instead of text**
`Balance`, `ReceiveQR`, and `TransactionHistory` currently show plain "Loading…" text. Replace with a small skeleton/shimmer for a more polished drop-in look.

**#4 — Error boundary example**
Add a short doc/example showing how to wrap these components in an error boundary, since Horizon calls can fail for various network reasons.

### Medium

**#5 — Additional wallet adapters**
`SendPayment` and `useFreighter` currently only cover Freighter. Add adapter hooks for Albedo and xBull with the same `{ publicKey, connect, signTransaction }` shape, so consumers can swap wallets without changing component usage.

**#6 — Unit tests**
Add a test suite (Vitest + React Testing Library) covering each component's empty/loading/error/success states, using mocked Horizon responses.

**#7 — TransactionHistory pagination**
Currently fetches a fixed `limit` with no way to load more. Add a "Load more" control using Horizon's paging tokens.

**#8 — Storybook**
Set up Storybook against `src/` so each component's states (empty, loading, error, populated) can be viewed and visually tested in isolation, independent of the demo app's wallet-connect flow.

### Bigger lifts

**#9 — Publish to npm**
Package and publish `stellar-payment-ui` under that name (or an available alternative), with a release workflow and semantic versioning.

**#10 — TypeScript types**
Add `.d.ts` type definitions (or migrate `src/` to TypeScript) so consumers get autocomplete and prop-shape checking.

**#11 — Theming API**
Replace hardcoded class names with a small theming system (CSS variables or a `theme` prop) so consumers can restyle without overriding classes by hand.
