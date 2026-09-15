import { useState } from "react";
import { TransactionBuilder, Operation, Asset, Memo, BASE_FEE } from "@stellar/stellar-sdk";
import { getServer, getNetworkPassphrase } from "../lib/horizon.js";

/**
 * A self-contained send-payment form. Builds a native-XLM payment
 * transaction, hands it to `signTransaction` (wallet-agnostic — pass
 * `useFreighter().signTransaction` or your own), then submits it.
 *
 * @param {string} sourcePublicKey - the connected account sending the payment
 * @param {(xdr: string) => Promise<string>} signTransaction - returns a signed XDR string
 * @param {(result: object) => void} [onSuccess]
 * @param {(error: Error) => void} [onError]
 */
export function SendPayment({ sourcePublicKey, signTransaction, onSuccess, onError }) {
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!sourcePublicKey || !signTransaction) {
      setStatus({ ok: false, message: "No wallet connected" });
      return;
    }

    setSending(true);
    setStatus(null);

    try {
      const server = getServer();
      const account = await server.loadAccount(sourcePublicKey);

      const builder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: getNetworkPassphrase(),
      }).addOperation(
        Operation.payment({ destination, asset: Asset.native(), amount })
      );

      if (memo) builder.addMemo(Memo.text(memo));

      const builtTx = builder.setTimeout(60).build();
      const signedXdr = await signTransaction(builtTx.toXDR());
      const result = await server.submitTransaction(
        TransactionBuilder.fromXDR(signedXdr, getNetworkPassphrase())
      );

      setStatus({ ok: true, message: `Sent. Hash: ${result.hash}` });
      setDestination("");
      setAmount("");
      setMemo("");
      onSuccess?.(result);
    } catch (err) {
      setStatus({ ok: false, message: err.message });
      onError?.(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="stellar-ui-send" onSubmit={handleSubmit}>
      <div className="stellar-ui-form-group">
        <label htmlFor="stellar-dest">
          <span>Recipient Address</span>
          <span className="stellar-ui-label-sub">Stellar Testnet G... address</span>
        </label>
        <div className="stellar-ui-input-wrap">
          <input
            id="stellar-dest"
            value={destination}
            onChange={(e) => setDestination(e.target.value.trim())}
            placeholder="GA5Z... or G..."
            required
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      <div className="stellar-ui-form-group">
        <div className="stellar-ui-label-row">
          <label htmlFor="stellar-amount">Amount</label>
          <div className="stellar-ui-quick-amounts">
            {["5", "25", "100"].map((preset) => (
              <button
                type="button"
                key={preset}
                className="stellar-ui-chip"
                onClick={() => setAmount(preset)}
              >
                {preset} XLM
              </button>
            ))}
          </div>
        </div>
        <div className="stellar-ui-input-wrap stellar-ui-input-addon">
          <input
            id="stellar-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            required
            autoComplete="off"
          />
          <span className="stellar-ui-addon-badge">XLM</span>
        </div>
      </div>

      <div className="stellar-ui-form-group">
        <label htmlFor="stellar-memo">
          <span>Memo</span>
          <span className="stellar-ui-label-sub">Optional text note (max 28 chars)</span>
        </label>
        <div className="stellar-ui-input-wrap">
          <input
            id="stellar-memo"
            value={memo}
            maxLength={28}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Payment memo reference"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="stellar-ui-send-footer">
        <div className="stellar-ui-fee-notice">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Est. Fee: 0.00001 XLM (100 stroops)</span>
        </div>
        <button
          type="submit"
          className="stellar-ui-btn stellar-ui-btn-primary stellar-ui-send-btn"
          disabled={sending || !sourcePublicKey}
        >
          {sending ? (
            <>
              <span className="stellar-ui-spinner"></span>
              <span>Confirming with Freighter...</span>
            </>
          ) : (
            <>
              <span>Send Payment</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </>
          )}
        </button>
      </div>

      {status && (
        <div className={`stellar-ui-status ${status.ok ? "stellar-ui-status-ok" : "stellar-ui-status-error"}`}>
          <div className="stellar-ui-status-icon">{status.ok ? "✓" : "!"}</div>
          <div className="stellar-ui-status-text">
            <span>{status.message}</span>
            {status.ok && status.message.includes("Hash:") && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${status.message.split("Hash: ")[1]}`}
                target="_blank"
                rel="noreferrer"
                className="stellar-ui-status-link"
              >
                Track on Stellar.Expert ↗
              </a>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
