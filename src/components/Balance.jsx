import { useStellarAccount } from "../hooks/useStellarAccount.js";

/**
 * Displays an account's native XLM balance.
 *
 * @param {string} publicKey
 * @param {number} [pollMs] - re-fetch interval in ms, 0 = no polling
 */
export function Balance({ publicKey, pollMs = 0 }) {
  const { nativeBalance, balances, loading, error } = useStellarAccount(publicKey, { pollMs });

  if (!publicKey) {
    return (
      <div className="stellar-ui-balance stellar-ui-empty">
        <span className="stellar-ui-empty-dot">○</span>
        <span>No account connected</span>
      </div>
    );
  }

  if (loading && !nativeBalance) {
    return (
      <div className="stellar-ui-balance stellar-ui-loading">
        <div className="stellar-ui-skeleton-amount"></div>
        <div className="stellar-ui-skeleton-label"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stellar-ui-balance stellar-ui-error">
        <span className="stellar-ui-error-badge">Error</span>
        <span>{error}</span>
      </div>
    );
  }

  const otherBalances = (balances || []).filter((b) => b.asset_type !== "native");

  return (
    <div className="stellar-ui-balance-container">
      <div className="stellar-ui-balance">
        <div className="stellar-ui-balance-main">
          <span className="stellar-ui-balance-amount">
            {nativeBalance
              ? Number(nativeBalance.balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })
              : "0.00"}
          </span>
          <span className="stellar-ui-balance-asset">XLM</span>
        </div>
        {pollMs > 0 && (
          <span className="stellar-ui-poll-badge" title={`Live syncing every ${pollMs / 1000}s`}>
            <span className="stellar-ui-pulse-dot"></span>
            <span>Live</span>
          </span>
        )}
      </div>

      {otherBalances.length > 0 && (
        <div className="stellar-ui-other-balances">
          {otherBalances.map((b, i) => (
            <div key={i} className="stellar-ui-other-balance-item">
              <span className="stellar-ui-other-amount">
                {Number(b.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
              <span className="stellar-ui-other-code">{b.asset_code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
