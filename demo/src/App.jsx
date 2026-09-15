import {
  Balance,
  SendPayment,
  ReceiveQR,
  TransactionHistory,
  useFreighter,
  configureNetwork,
} from "stellar-payment-ui";
import { Networks } from "@stellar/stellar-sdk";
import "../../src/styles.css";

configureNetwork({
  horizonUrl: "https://horizon-testnet.stellar.org",
  passphrase: Networks.TESTNET,
});

export default function App() {
  const { publicKey, available, connecting, connect, disconnect, signTransaction } = useFreighter();

  return (
    <div className="demo">
      <h1>Stellar Payment UI</h1>
      <p className="demo-subtitle">
        Drop-in React components for Stellar payments — this demo runs against Testnet.
      </p>

      <div className="demo-wallet-bar">
        {!publicKey ? (
          <button onClick={connect} disabled={connecting || available === false}>
            {available === false ? "Freighter not installed" : connecting ? "Connecting…" : "Connect Freighter"}
          </button>
        ) : (
          <>
            <span className="demo-address">{publicKey}</span>
            <button onClick={disconnect}>Disconnect</button>
          </>
        )}
      </div>

      <div className="demo-grid">
        <section className="demo-card">
          <h2>Balance</h2>
          <Balance publicKey={publicKey} pollMs={15000} />
        </section>

        <section className="demo-card">
          <h2>Receive</h2>
          <ReceiveQR publicKey={publicKey} />
        </section>

        <section className="demo-card">
          <h2>Send</h2>
          <SendPayment sourcePublicKey={publicKey} signTransaction={signTransaction} />
        </section>

        <section className="demo-card demo-card-wide">
          <h2>Transaction History</h2>
          <TransactionHistory publicKey={publicKey} />
        </section>
      </div>
    </div>
  );
}
