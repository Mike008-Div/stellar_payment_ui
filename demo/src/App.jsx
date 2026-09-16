import { useState } from "react";
import {
  Balance,
  SendPayment,
  ReceiveQR,
  TransactionHistory,
  ErrorBoundary,
  ThemeProvider,
  useWallet,
  useEscrowContract,
  configureNetwork,
} from "stellar-payment-ui";
import { Networks } from "@stellar/stellar-sdk";
import "../../src/styles.css";

configureNetwork({
  horizonUrl: "https://horizon-testnet.stellar.org",
  passphrase: Networks.TESTNET,
});

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [activeTab, setActiveTab] = useState("payments"); // "payments" | "escrow"
  const [contractId, setContractId] = useState("");
  const [assetContractId, setAssetContractId] = useState("CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"); // Native XLM contract on testnet
  const [payee, setPayee] = useState("");
  const [escrowAmount, setEscrowAmount] = useState("10");
  const [escrowDuration, setEscrowDuration] = useState("3600");
  const [escrowIdToManage, setEscrowIdToManage] = useState("");
  const [escrowDetails, setEscrowDetails] = useState(null);

  const wallet = useWallet("freighter");
  const {
    activeWalletType,
    selectWallet,
    publicKey,
    available,
    connecting,
    connect,
    disconnect,
    signTransaction,
  } = wallet;

  const escrow = useEscrowContract(contractId, { publicKey, signTransaction });

  const sampleAssets = [
    { type: "native", code: "XLM" },
    { code: "USDC", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
    { code: "EURC", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
  ];

  async function handleCreateEscrow(e) {
    e.preventDefault();
    try {
      const res = await escrow.createEscrow({
        payee,
        assetContractId,
        amount: escrowAmount,
        releaseAfterSeconds: Number(escrowDuration),
      });
      alert(`Escrow created! Result: ${JSON.stringify(res)}`);
    } catch (err) {
      alert(`Error creating escrow: ${err.message}`);
    }
  }

  async function handleFetchEscrow() {
    if (!escrowIdToManage) return;
    const data = await escrow.fetchEscrow(escrowIdToManage);
    setEscrowDetails(data);
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="demo">
        <header className="demo-header">
          <div>
            <h1>Stellar Payment UI</h1>
            <p className="demo-subtitle">
              Comprehensive React components & Soroban contract tools for Stellar Testnet.
            </p>
          </div>
          <div className="demo-controls">
            <button
              type="button"
              className="demo-theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </header>

        {/* Wallet Selection & Connection Bar */}
        <div className="demo-wallet-bar">
          <div className="demo-wallet-select">
            <label>Wallet:</label>
            <select
              value={activeWalletType}
              onChange={(e) => selectWallet(e.target.value)}
              disabled={!!publicKey}
            >
              <option value="freighter">Freighter</option>
              <option value="albedo">Albedo</option>
              <option value="xbull">xBull</option>
            </select>
          </div>

          {!publicKey ? (
            <button
              className="stellar-ui-btn stellar-ui-btn-primary"
              onClick={() => connect()}
              disabled={connecting || available === false}
            >
              {available === false
                ? `${activeWalletType} not detected`
                : connecting
                ? "Connecting…"
                : `Connect ${activeWalletType}`}
            </button>
          ) : (
            <div className="demo-connected-user">
              <span className="demo-address" title={publicKey}>
                {publicKey.slice(0, 6)}...{publicKey.slice(-6)}
              </span>
              <button className="stellar-ui-btn stellar-ui-btn-secondary" onClick={disconnect}>
                Disconnect
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="demo-tabs">
          <button
            className={`demo-tab ${activeTab === "payments" ? "is-active" : ""}`}
            onClick={() => setActiveTab("payments")}
          >
            Payments & Account
          </button>
          <button
            className={`demo-tab ${activeTab === "escrow" ? "is-active" : ""}`}
            onClick={() => setActiveTab("escrow")}
          >
            Soroban Escrow
          </button>
        </div>

        {activeTab === "payments" ? (
          <div className="demo-grid">
            <section className="demo-card">
              <h2>Balance</h2>
              <ErrorBoundary>
                <Balance publicKey={publicKey} pollMs={15000} />
              </ErrorBoundary>
            </section>

            <section className="demo-card">
              <h2>Receive QR</h2>
              <ErrorBoundary>
                <ReceiveQR publicKey={publicKey} />
              </ErrorBoundary>
            </section>

            <section className="demo-card">
              <h2>Send Payment (Multi-Asset)</h2>
              <ErrorBoundary>
                <SendPayment
                  sourcePublicKey={publicKey}
                  signTransaction={signTransaction}
                  assets={sampleAssets}
                />
              </ErrorBoundary>
            </section>

            <section className="demo-card demo-card-wide">
              <h2>Transaction History (Paginated)</h2>
              <ErrorBoundary>
                <TransactionHistory publicKey={publicKey} limit={5} />
              </ErrorBoundary>
            </section>
          </div>
        ) : (
          <div className="demo-grid">
            {/* Escrow Contract Configuration */}
            <section className="demo-card demo-card-wide">
              <h2>Escrow Contract Setup</h2>
              <div className="stellar-ui-form-group" style={{ marginBottom: 12 }}>
                <label>Deployed Escrow Contract Address (C...)</label>
                <input
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value.trim())}
                  placeholder="CA... or C..."
                  className="demo-input"
                />
              </div>
            </section>

            {/* Create Escrow */}
            <section className="demo-card">
              <h2>Create New Escrow</h2>
              <form onSubmit={handleCreateEscrow} className="stellar-ui-send">
                <div className="stellar-ui-form-group">
                  <label>Payee Address (G...)</label>
                  <input
                    value={payee}
                    onChange={(e) => setPayee(e.target.value.trim())}
                    placeholder="GB..."
                    required
                  />
                </div>
                <div className="stellar-ui-form-group">
                  <label>Asset Contract (C...)</label>
                  <input
                    value={assetContractId}
                    onChange={(e) => setAssetContractId(e.target.value.trim())}
                    placeholder="Token contract address"
                    required
                  />
                </div>
                <div className="stellar-ui-form-group">
                  <label>Amount (Tokens)</label>
                  <input
                    value={escrowAmount}
                    onChange={(e) => setEscrowAmount(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
                <div className="stellar-ui-form-group">
                  <label>Lock Duration (Seconds)</label>
                  <input
                    value={escrowDuration}
                    onChange={(e) => setEscrowDuration(e.target.value)}
                    placeholder="3600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="stellar-ui-btn stellar-ui-btn-primary"
                  disabled={escrow.loading || !publicKey || !contractId}
                >
                  {escrow.loading ? "Creating on Soroban…" : "Create Escrow"}
                </button>
              </form>
            </section>

            {/* Manage Existing Escrow */}
            <section className="demo-card">
              <h2>Manage Escrow</h2>
              <div className="stellar-ui-form-group" style={{ marginBottom: 12 }}>
                <label>Escrow ID</label>
                <input
                  type="number"
                  value={escrowIdToManage}
                  onChange={(e) => setEscrowIdToManage(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <button
                  type="button"
                  className="stellar-ui-btn stellar-ui-btn-secondary"
                  onClick={handleFetchEscrow}
                  disabled={!contractId || !escrowIdToManage}
                >
                  Inspect Status
                </button>
                <button
                  type="button"
                  className="stellar-ui-btn stellar-ui-btn-primary"
                  onClick={() => escrow.fundEscrow(escrowIdToManage)}
                  disabled={escrow.loading || !publicKey || !contractId || !escrowIdToManage}
                >
                  Fund
                </button>
                <button
                  type="button"
                  className="stellar-ui-btn stellar-ui-btn-primary"
                  onClick={() => escrow.releaseEscrow(escrowIdToManage)}
                  disabled={escrow.loading || !publicKey || !contractId || !escrowIdToManage}
                >
                  Release
                </button>
                <button
                  type="button"
                  className="stellar-ui-btn stellar-ui-btn-secondary"
                  onClick={() => escrow.refundEscrow(escrowIdToManage)}
                  disabled={escrow.loading || !publicKey || !contractId || !escrowIdToManage}
                >
                  Refund
                </button>
              </div>

              {escrowDetails && (
                <pre className="demo-details-box">
                  {JSON.stringify(escrowDetails, null, 2)}
                </pre>
              )}
            </section>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
