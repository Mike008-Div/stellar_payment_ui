import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary.jsx";

function ThrowingComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error("Horizon Network Timeout");
  }
  return <div>Safe Content</div>;
}

describe("ErrorBoundary Component", () => {
  it("renders children normally when no error occurs", () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(container.textContent).toContain("Safe Content");
  });

  it("catches errors and renders fallback UI with retry", () => {
    // Suppress console.error in test output for intentional render error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(container.textContent).toContain("Something went wrong");
    expect(container.textContent).toContain("Horizon Network Timeout");
    expect(container.querySelector(".stellar-ui-btn")).toBeTruthy();

    spy.mockRestore();
  });
});
