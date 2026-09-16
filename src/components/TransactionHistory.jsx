import { useEffect, useState } from "react";
import { getServer } from "../lib/horizon.js";

/**
 * Lists an account's recent payments (incoming and outgoing).
 */
export function TransactionHistory({ publicKey, limit = 10 }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!publicKey) {
      setPayments([]);
      setCursor(null);
      setHasMore(false);
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
        if (!cancelled) {
          setPayments(page.records);
          if (page.records.length > 0) {
            setCursor(page.records[page.records.length - 1].paging_token);
            setHasMore(page.records.length >= limit);
          } else {
            setHasMore(false);
          }
        }
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

  async function handleLoadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);

    try {
      const page = await getServer()
        .payments()
        .forAccount(publicKey)
        .order("desc")
        .limit(limit)
        .cursor(cursor)
        .call();

      if (page.records.length > 0) {
        setPayments((prev) => [...prev, ...page.records]);
        setCursor(page.records[page.records.length - 1].paging_token);
        setHasMore(page.records.length >= limit);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }

  if (!publicKey) {
    return <div className="stellar-ui-history stellar-ui-empty">No account connected</div>;
  }
  if (loading) {
    return (
      <div className="stellar-ui-history stellar-ui-loading-list">
        {[1, 2, 3].map((n) => (
          <div key={n} className="stellar-ui-skeleton-row">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
              <div className="stellar-ui-skeleton-circle"></div>
              <div className="stellar-ui-skeleton-lines">
                <div className="stellar-ui-skeleton-line" style={{ width: "60%" }}></div>
                <div className="stellar-ui-skeleton-line" style={{ width: "35%", height: 10 }}></div>
              </div>
            </div>
            <div className="stellar-ui-skeleton-line" style={{ width: 65, height: 14 }}></div>
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return <div className="stellar-ui-history stellar-ui-error">Error: {error}</div>;
  }
  if (payments.length === 0) {
    return <div className="stellar-ui-history stellar-ui-empty">No transactions yet</div>;
  }

  return (
    <div className="stellar-ui-history-container">
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

      {hasMore && (
        <div className="stellar-ui-history-pagination">
          <button
            type="button"
            className="stellar-ui-btn stellar-ui-btn-secondary stellar-ui-load-more-btn"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="stellar-ui-spinner"></span>
                <span>Loading more…</span>
              </>
            ) : (
              <span>Load More</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
