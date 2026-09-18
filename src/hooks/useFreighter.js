import { useState, useCallback, useEffect } from "react";
import freighterApi from "@stellar/freighter-api";

/**
 * This wraps the Freighter browser-extension wallet. Exposes a wallet-agnostic
 * `signTransaction(xdr)` so UI components don't need to know which wallet
 * they're talking to.
 *
 * NOTE: @stellar/freighter-api's exact method names have shifted across
 * major versions. Check the installed version's docs if `connect`/
 * `signTransaction` below don't match — see ISSUES.md #1.
 */
export function useFreighter() {
  const [publicKey, setPublicKey] = useState(null);
  const [available, setAvailable] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    freighterApi
      .isConnected()
      .then((res) => setAvailable(Boolean(res?.isConnected ?? res)))
      .catch(() => setAvailable(false));
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const access = await freighterApi.requestAccess();
      const key = access?.address || access?.publicKey || access;
      setPublicKey(key);
      return key;
    } catch (err) {
      setError(err.message);
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
      const result = await freighterApi.signTransaction(xdr, {
        address: publicKey,
        ...opts,
      });
      return result?.signedTxXdr || result;
    },
    [publicKey]
  );

  return { publicKey, available, connecting, error, connect, disconnect, signTransaction };
}
