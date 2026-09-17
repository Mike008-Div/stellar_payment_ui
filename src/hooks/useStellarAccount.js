import { useEffect, useState, useCallback } from "react";
import { getServer } from "../lib/horizon.js";

/**
 * This loads (and optionally polls) an account's balances from Horizon.
 *
 * @param {string} publicKey - the account to load, or null/undefined
 * @param {{ pollMs?: number }} options - pollMs: re-fetch interval, 0 = no polling
 */
export function useStellarAccount(publicKey, { pollMs = 0 } = {}) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setAccount(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const acc = await getServer().loadAccount(publicKey);
      setAccount(acc);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    refresh();
    if (!pollMs) return;
    const id = setInterval(refresh, pollMs);
    return () => clearInterval(id);
  }, [refresh, pollMs]);

  const balances = account?.balances || [];
  const nativeBalance = balances.find((b) => b.asset_type === "native");

  return { account, balances, nativeBalance, loading, error, refresh };
}
