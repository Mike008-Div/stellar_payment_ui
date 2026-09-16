import { ReactNode, ComponentType } from "react";
import { Asset, Server } from "@stellar/stellar-sdk";

export interface BalanceProps {
  publicKey?: string | null;
  pollMs?: number;
}

export interface ReceiveQRProps {
  publicKey?: string | null;
  size?: number;
  loading?: boolean;
}

export type AssetDefinition =
  | Asset
  | "native"
  | { code: string; issuer?: string; type?: string };

export interface SendPaymentProps {
  sourcePublicKey: string | null;
  signTransaction: (xdr: string, opts?: any) => Promise<string>;
  asset?: AssetDefinition;
  assets?: AssetDefinition[];
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export interface TransactionHistoryProps {
  publicKey?: string | null;
  limit?: number;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((error: Error | null, reset: () => void) => ReactNode);
  title?: string;
  onError?: (error: Error, errorInfo: any) => void;
  onReset?: () => void;
}

export interface ThemeProviderProps {
  children?: ReactNode;
  theme?: "dark" | "light" | "auto" | string;
  customTheme?: Record<string, string>;
  className?: string;
}

export interface BalanceRecord {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export interface UseStellarAccountResult {
  account: any | null;
  balances: BalanceRecord[];
  nativeBalance: BalanceRecord | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface WalletAdapter {
  walletType: string;
  publicKey: string | null;
  available: boolean | null;
  connecting: boolean;
  error: string | null;
  connect: (opts?: any) => Promise<string>;
  disconnect: () => void;
  signTransaction: (xdr: string, opts?: any) => Promise<string>;
}

export interface UseWalletResult extends WalletAdapter {
  activeWalletType: "freighter" | "albedo" | "xbull" | string;
  selectWallet: (type: "freighter" | "albedo" | "xbull" | string) => void;
  supportedWallets: string[];
  wallets: {
    freighter: WalletAdapter;
    albedo: WalletAdapter;
    xbull: WalletAdapter;
  };
}

export interface NetworkConfig {
  horizonUrl?: string;
  networkPassphrase?: string;
}

export declare const Balance: ComponentType<BalanceProps>;
export declare const ReceiveQR: ComponentType<ReceiveQRProps>;
export declare const SendPayment: ComponentType<SendPaymentProps>;
export declare const TransactionHistory: ComponentType<TransactionHistoryProps>;
export declare const ErrorBoundary: ComponentType<ErrorBoundaryProps>;
export declare const ThemeProvider: ComponentType<ThemeProviderProps>;

export declare function useTheme(): { theme: string };
export declare function useStellarAccount(
  publicKey?: string | null,
  options?: { pollMs?: number }
): UseStellarAccountResult;
export declare function useFreighter(): WalletAdapter;
export declare function useAlbedo(): WalletAdapter;
export declare function useXBull(): WalletAdapter;
export declare function useWallet(initialWallet?: string): UseWalletResult;

export declare function configureNetwork(config: NetworkConfig): void;
export declare function getServer(): Server;
export declare function getNetworkPassphrase(): string;
