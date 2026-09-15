import { useEffect, useState } from "react";
import { getServer } from "../lib/horizon.js";

/**
 * Lists an account's recent payments (incoming and outgoing).
 */
export function TransactionHistory({ publicKey, limit = 10 }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!publicKey) {
      setPayments([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getServer()
      .payments()
      .forAccount(publicKey)
      .order("desc")
      .limit(limit)
      .call()
      .then((page) => {
        if (!cancelled) setPayments(page.records);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [publicKey, limit]);

  if (!publicKey) {
    return <div className="stellar-ui-history stellar-ui-empty">No account connected</div>;
  }
  if (loading) {
    return <div className="stellar-ui-history stellar-ui-loading">Loading transactions…</div>;
  }
  if (error) {
    return <div className="stellar-ui-history stellar-ui-error">Error: {error}</div>;
  }
  if (payments.length === 0) {
    return <div className="stellar-ui-history stellar-ui-empty">No transactions yet</div>;
  }

  return (
    <ul className="stellar-ui-history">
      {payments.map((p) => {
        const isOutgoing = p.from === publicKey || (p.type === "create_account" && p.funder === publicKey);
        const amount = p.amount || p.starting_balance;
        const asset = p.asset_type === "native" || !p.asset_code ? "XLM" : p.asset_code;
        const txHash = p.transaction_hash;
        const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }) : "";

        return (
          <li key={p.id} className={`stellar-ui-history-item ${isOutgoing ? "is-outgoing" : "is-incoming"}`}>
            <div className="stellar-ui-history-left">
              <span className={`stellar-ui-direction-badge ${isOutgoing ? "direction-out" : "direction-in"}`}>
                {isOutgoing ? "↗" : "↙"}
              </span>
              <div className="stellar-ui-history-meta">
                <span className="stellar-ui-history-type">
                  {p.type === "create_account" ? "Account Created" : isOutgoing ? "Sent" : "Received"}
                </span>
                <span className="stellar-ui-history-date">{dateStr}</span>
              </div>
            </div>

            <div className="stellar-ui-history-right">
              {amount && (
                <span className={`stellar-ui-history-amount ${isOutgoing ? "amount-negative" : "amount-positive"}`}>
                  {isOutgoing ? "-" : "+"}{Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} {asset}
                </span>
              )}
              {txHash && (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="stellar-ui-history-link"
                  title="View on Stellar.Expert"
                >
                  View ↗
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
