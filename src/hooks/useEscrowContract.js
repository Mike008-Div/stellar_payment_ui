import { useState, useCallback } from "react";
import { Address, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
import { buildContractCall, submitSorobanTransaction, getSorobanServer } from "../lib/soroban.js";

/**
 * This is a hook to manage Soroban Escrow contract interactions:
 * create, fund, release, refund, and fetch escrow details.
 *
 * @param {string} contractId - Deployed Escrow contract address (C...)
 * @param {object} wallet - Wallet instance with { publicKey, signTransaction }
 */
export function useEscrowContract(contractId, wallet) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const { publicKey, signTransaction } = wallet || {};

  const executeContractMethod = useCallback(
    async (method, rawArgs) => {
      if (!contractId) throw new Error("Contract ID is required.");
      if (!publicKey || !signTransaction) throw new Error("Wallet must be connected to execute escrow contracts.");

      setLoading(true);
      setError(null);

      try {
        const preparedTx = await buildContractCall({
          contractId,
          method,
          args: rawArgs,
          sourcePublicKey: publicKey,
        });

        const signedXdr = await signTransaction(preparedTx.toXDR());
        const result = await submitSorobanTransaction(signedXdr);
        setLastResult(result);
        return result;
      } catch (err) {
        const msg = err.message || `Failed to execute ${method}`;
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contractId, publicKey, signTransaction]
  );

  const createEscrow = useCallback(
    async ({ payee, assetContractId, amount, releaseAfterSeconds }) => {
      const payerAddr = Address.fromString(publicKey);
      const payeeAddr = Address.fromString(payee);
      const assetAddr = Address.fromString(assetContractId);
      const amountBigInt = BigInt(Math.floor(Number(amount) * 10_000_000));
      const releaseTimestamp = BigInt(Math.floor(Date.now() / 1000) + releaseAfterSeconds);

      return executeContractMethod("create", [
        payerAddr,
        payeeAddr,
        assetAddr,
        amountBigInt,
        releaseTimestamp,
      ]);
    },
    [publicKey, executeContractMethod]
  );

  const fundEscrow = useCallback(
    async (escrowId) => {
      return executeContractMethod("fund", [Number(escrowId)]);
    },
    [executeContractMethod]
  );

  const releaseEscrow = useCallback(
    async (escrowId) => {
      return executeContractMethod("release", [Number(escrowId)]);
    },
    [executeContractMethod]
  );

  const refundEscrow = useCallback(
    async (escrowId) => {
      return executeContractMethod("refund", [Number(escrowId)]);
    },
    [executeContractMethod]
  );

  const fetchEscrow = useCallback(
    async (escrowId) => {
      if (!contractId) return null;
      try {
        const sorobanServer = getSorobanServer();
        // Read contract storage / simulation call for 'get'
        const preparedTx = await buildContractCall({
          contractId,
          method: "get",
          args: [Number(escrowId)],
          sourcePublicKey: publicKey || "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5", // fallback public key for read simulation
        });
        const sim = await sorobanServer.simulateTransaction(preparedTx);
        if (sim.result?.retval) {
          return scValToNative(sim.result.retval);
        }
        return null;
      } catch (err) {
        console.error("Failed to fetch escrow details:", err);
        return null;
      }
    },
    [contractId, publicKey]
  );

  return {
    loading,
    error,
    lastResult,
    createEscrow,
    fundEscrow,
    releaseEscrow,
    refundEscrow,
    fetchEscrow,
  };
}
