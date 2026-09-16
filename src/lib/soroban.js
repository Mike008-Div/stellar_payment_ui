import {
  Contract,
  Address,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  rpc,
} from "@stellar/stellar-sdk";
import { getServer, getNetworkPassphrase } from "./horizon.js";

let rpcUrl = "https://soroban-testnet.stellar.org";

/**
 * Configure the Soroban RPC server endpoint.
 */
export function configureSorobanRpc(url) {
  rpcUrl = url;
}

export function getSorobanServer() {
  return new rpc.Server(rpcUrl);
}

/**
 * Builds a Soroban contract call transaction for a given method and arguments.
 */
export async function buildContractCall({
  contractId,
  method,
  args = [],
  sourcePublicKey,
}) {
  const horizonServer = getServer();
  const sorobanServer = getSorobanServer();
  const account = await horizonServer.loadAccount(sourcePublicKey);

  const contract = new Contract(contractId);
  const scArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null && arg.scVal) {
      return arg.scVal;
    }
    return nativeToScVal(arg);
  });

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(60)
    .build();

  // Simulate / prepare Soroban transaction (resource fees & footers)
  const preparedTx = await sorobanServer.prepareTransaction(tx);
  return preparedTx;
}

/**
 * Submits a signed Soroban transaction and polls for completion.
 */
export async function submitSorobanTransaction(signedXdr) {
  const sorobanServer = getSorobanServer();
  const tx = TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase());
  const sendResponse = await sorobanServer.sendTransaction(tx);

  if (sendResponse.status === "ERROR") {
    throw new Error(
      `Soroban transaction rejected: ${JSON.stringify(sendResponse.errorResultXdr || sendResponse)}`
    );
  }

  // Poll for status
  let getResponse = await sorobanServer.getTransaction(sendResponse.hash);
  let attempts = 0;
  while (getResponse.status === "NOT_FOUND" && attempts < 15) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    getResponse = await sorobanServer.getTransaction(sendResponse.hash);
    attempts++;
  }

  if (getResponse.status === "FAILED") {
    throw new Error(`Soroban transaction failed on ledger: ${sendResponse.hash}`);
  }

  return {
    hash: sendResponse.hash,
    status: getResponse.status,
    returnValue: getResponse.returnValue ? scValToNative(getResponse.returnValue) : null,
  };
}
