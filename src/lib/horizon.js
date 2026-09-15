import { Horizon, Networks } from "@stellar/stellar-sdk";

let server = new Horizon.Server("https://horizon-testnet.stellar.org");
let networkPassphrase = Networks.TESTNET;

/**
 * Point the library at a different Horizon instance / network.
 * Call this once, before rendering any components, if you're not
 * targeting Testnet.
 */
export function configureNetwork({ horizonUrl, passphrase }) {
  if (horizonUrl) server = new Horizon.Server(horizonUrl);
  if (passphrase) networkPassphrase = passphrase;
}

export function getServer() {
  return server;
}

export function getNetworkPassphrase() {
  return networkPassphrase;
}
