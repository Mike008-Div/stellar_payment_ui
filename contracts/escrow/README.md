# Soroban escrow contract

This contract adds programmable escrow without changing the existing direct XLM payment flow.

## Lifecycle

1. `create(payer, payee, asset, amount, release_after)` creates an unfunded escrow.
2. `fund(escrow_id)` transfers the asset from the payer to the contract.
3. `release(escrow_id)` transfers the funds to the payee. The payer must authorize it.
4. `refund(escrow_id)` returns the funds to the payer after `release_after`.

The contract accepts any Soroban-compatible token contract address. For native XLM, use Stellar's wrapped native asset contract rather than `Asset.native()` from a classic transaction.

## Build

```powershell
cargo test -p stellar-payment-escrow
cargo build -p stellar-payment-escrow --target wasm32-unknown-unknown --release
```

If the WebAssembly target is missing:

```powershell
rustup target add wasm32-unknown-unknown
```

## Deploy and invoke

Install the Stellar CLI separately, then configure a testnet identity and deploy the generated WASM:

```powershell
stellar contract build
stellar contract deploy `
  --wasm target\wasm32-unknown-unknown\release\stellar_payment_escrow.wasm `
  --source alice `
  --network testnet
```

Use the deployed contract ID in the frontend only after the contract has been reviewed and tested on Testnet. The existing `SendPayment` component remains the right path for a simple direct XLM transfer.
