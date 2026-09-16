import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * Shows a scannable QR code for the account's public key, plus a
 * copy-to-clipboard button.
 */
export function ReceiveQR({ publicKey, size = 180, loading = false }) {
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="stellar-ui-receive stellar-ui-loading">
        <div className="stellar-ui-skeleton-qr" style={{ width: size, height: size }}></div>
        <div className="stellar-ui-skeleton-label" style={{ width: 120, margin: "12px auto 0" }}></div>
      </div>
    );
  }

  if (!publicKey) {
    return <div className="stellar-ui-receive stellar-ui-empty">No account connected</div>;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  }

  const shortAddress = publicKey
    ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`
    : "";

  return (
    <div className="stellar-ui-receive">
      <div className="stellar-ui-qr-frame">
        <QRCodeSVG
          value={publicKey}
          size={size}
          level="M"
          bgColor="#ffffff"
          fgColor="#0c1017"
          includeMargin={false}
        />
      </div>
      <div className="stellar-ui-receive-details">
        <span className="stellar-ui-receive-label">Your Stellar Address</span>
        <code className="stellar-ui-receive-address" title={publicKey}>
          {publicKey}
        </code>
      </div>
      <button
        type="button"
        className={`stellar-ui-btn stellar-ui-btn-secondary stellar-ui-copy-btn ${copied ? "is-copied" : ""}`}
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Address Copied!</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy Address</span>
          </>
        )}
      </button>
    </div>
  );
}
