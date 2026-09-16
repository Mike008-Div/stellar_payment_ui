import { useState, useMemo, useCallback } from "react";
import { useFreighter } from "./useFreighter.js";
import { useAlbedo } from "./useAlbedo.js";
import { useXBull } from "./useXBull.js";

/**
 * Unified multi-wallet selector hook for Stellar Payment UI.
 * Allows switching between Freighter, Albedo, and xBull wallets seamlessly.
 *
 * @param {string} [initialWallet="freighter"] - "freighter" | "albedo" | "xbull"
 */
export function useWallet(initialWallet = "freighter") {
  const [activeWalletType, setActiveWalletType] = useState(initialWallet);

  const freighter = useFreighter();
  const albedo = useAlbedo();
  const xbull = useXBull();

  const wallets = useMemo(
    () => ({
      freighter,
      albedo,
      xbull,
    }),
    [freighter, albedo, xbull]
  );

  const activeWallet = wallets[activeWalletType] || freighter;

  const selectWallet = useCallback((type) => {
    if (wallets[type]) {
      setActiveWalletType(type);
    }
  }, [wallets]);

  return {
    activeWalletType,
    selectWallet,
    supportedWallets: ["freighter", "albedo", "xbull"],
    publicKey: activeWallet.publicKey,
    available: activeWallet.available,
    connecting: activeWallet.connecting,
    error: activeWallet.error,
    connect: activeWallet.connect,
    disconnect: activeWallet.disconnect,
    signTransaction: activeWallet.signTransaction,
    wallets,
  };
}
