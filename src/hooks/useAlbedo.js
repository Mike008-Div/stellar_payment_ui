import { useState, useCallback, useEffect } from "react";

/**
 * Hook for Albedo wallet integration.
 * Connects via window.albedo or web intents with zero external runtime bundle bloat.
 */
export function useAlbedo() {
  const [publicKey, setPublicKey] = useState(null);
  const [available, setAvailable] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Albedo works in any modern browser via web intent iframe/popup or browser extension
    setAvailable(typeof window !== "undefined");
  }, []);

  const connect = useCallback(async (opts = {}) => {
    setConnecting(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && window.albedo) {
        const res = await window.albedo.publicKey(opts);
        setPublicKey(res.pubkey);
        return res.pubkey;
      }

      // Dynamic import / global fallback
      const albedoModule = await import("@albedo-link/intent").catch(() => null);
      if (albedoModule?.default) {
        const res = await albedoModule.default.publicKey(opts);
        setPublicKey(res.pubkey);
        return res.pubkey;
      }

      throw new Error("Albedo SDK is not installed. Please install @albedo-link/intent or use the Albedo browser extension.");
    } catch (err) {
      const msg = err.message || "Failed to connect to Albedo";
      setError(msg);
      throw err;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  const signTransaction = useCallback(
    async (xdr, opts = {}) => {
      try {
        if (typeof window !== "undefined" && window.albedo) {
          const res = await window.albedo.tx({ xdr, ...opts });
          return res.signed_envelope_xdr || res.xdr;
        }

        const albedoModule = await import("@albedo-link/intent").catch(() => null);
        if (albedoModule?.default) {
          const res = await albedoModule.default.tx({ xdr, ...opts });
          return res.signed_envelope_xdr || res.xdr;
        }

        throw new Error("Albedo wallet not available for transaction signing.");
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  return {
    walletType: "albedo",
    publicKey,
    available,
    connecting,
    error,
    connect,
    disconnect,
    signTransaction,
  };
}
