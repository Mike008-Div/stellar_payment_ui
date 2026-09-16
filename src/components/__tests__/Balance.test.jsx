import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { Balance } from "../Balance.jsx";
import * as accountHook from "../../hooks/useStellarAccount.js";

describe("Balance Component", () => {
  it("renders empty disconnected state when no publicKey provided", () => {
    const { container } = render(<Balance publicKey={null} />);
    expect(container.textContent).toContain("No account connected");
  });

  it("renders loading skeleton when account is loading", () => {
    vi.spyOn(accountHook, "useStellarAccount").mockReturnValue({
      nativeBalance: null,
      balances: [],
      loading: true,
      error: null,
    });

    const { container } = render(<Balance publicKey="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" />);
    expect(container.querySelector(".stellar-ui-skeleton-amount")).toBeTruthy();
  });

  it("renders native balance when loaded successfully", () => {
    vi.spyOn(accountHook, "useStellarAccount").mockReturnValue({
      nativeBalance: { balance: "123.4567", asset_type: "native" },
      balances: [{ balance: "123.4567", asset_type: "native" }],
      loading: false,
      error: null,
    });

    const { container } = render(<Balance publicKey="GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5" />);
    expect(container.textContent).toContain("123.4567");
    expect(container.textContent).toContain("XLM");
  });
});
