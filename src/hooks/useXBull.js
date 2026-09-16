import { useState, useCallback, useEffect } from "react";

/**
 * Hook for xBull Wallet integration.
 * Connects via window.xBullSDK browser extension.
 */
export function useXBull() {
  const [publicKey, setPublicKey] = useState(null);
  const [available, setAvailable] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setAvailable(false);
      return;
    }
    // Check if xBull SDK injected or extension available
    const hasXBull = Boolean(window.xBullSDK || window.xbull);
    setAvailable(hasXBull);
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      if (typeof window !== "undefined" && window.xBullSDK) {
        const address = await window.xBullSDK.getPublicKey();
        setPublicKey(address);
        return address;
      }
      if (typeof window !== "undefined" && window.xbull) {
        const address = await window.xbull.getPublicKey();
        setPublicKey(address);
        return address;
      }
      throw new Error("xBull Wallet is not detected. Please install the xBull browser extension.");
    } catch (err) {
      const msg = err.message || "Failed to connect to xBull";
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
        if (typeof window !== "undefined" && window.xBullSDK) {
          const signedXdr = await window.xBullSDK.signXDR(xdr, opts);
          return signedXdr;
        }
        if (typeof window !== "undefined" && window.xbull) {
          const signedXdr = await window.xbull.signXDR(xdr, opts);
          return signedXdr;
        }
        throw new Error("xBull Wallet not available for transaction signing.");
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  return {
    walletType: "xbull",
    publicKey,
    available,
    connecting,
    error,
    connect,
    disconnect,
    signTransaction,
  };
}
