import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { SendPayment } from "../SendPayment.jsx";

describe("SendPayment Component", () => {
  it("renders form fields for recipient, amount, and memo", () => {
    const { container } = render(
      <SendPayment
        sourcePublicKey="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
        signTransaction={vi.fn()}
      />
    );

    expect(container.querySelector("#stellar-dest")).toBeTruthy();
    expect(container.querySelector("#stellar-amount")).toBeTruthy();
    expect(container.querySelector("#stellar-memo")).toBeTruthy();
    expect(container.textContent).toContain("Send Payment");
  });

  it("renders multi-asset dropdown when assets array is provided", () => {
    const assets = [
      { type: "native", code: "XLM" },
      { code: "USDC", issuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" },
    ];

    const { container } = render(
      <SendPayment
        sourcePublicKey="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
        signTransaction={vi.fn()}
        assets={assets}
      />
    );

    const select = container.querySelector(".stellar-ui-addon-select");
    expect(select).toBeTruthy();
    expect(select.children.length).toBe(2);
  });
});
