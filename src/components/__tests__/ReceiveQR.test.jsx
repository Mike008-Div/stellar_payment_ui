import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { ReceiveQR } from "../ReceiveQR.jsx";

describe("ReceiveQR Component", () => {
  it("renders empty disconnected state when no publicKey provided", () => {
    const { container } = render(<ReceiveQR publicKey={null} />);
    expect(container.textContent).toContain("No account connected");
  });

  it("renders loading skeleton when loading prop is true", () => {
    const { container } = render(<ReceiveQR publicKey="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" loading={true} />);
    expect(container.querySelector(".stellar-ui-skeleton-qr")).toBeTruthy();
  });

  it("renders QR and copy address button when publicKey is provided", () => {
    const testKey = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
    const { container } = render(<ReceiveQR publicKey={testKey} />);
    expect(container.textContent).toContain("Your Stellar Address");
    expect(container.textContent).toContain(testKey);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
