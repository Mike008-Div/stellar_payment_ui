import React, { Component } from "react";

/**
 * React Error Boundary component designed specifically for Stellar Payment UI.
 * Catches render-time exceptions (e.g. malformed Horizon payloads, network drops)
 * and provides user-friendly fallback with a retry mechanism.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback(this.state.error, this.handleRetry)
          : this.props.fallback;
      }

      return (
        <div className="stellar-ui-error-boundary">
          <div className="stellar-ui-error-boundary-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h4>{this.props.title || "Something went wrong"}</h4>
          </div>
          <p className="stellar-ui-error-boundary-message">
            {this.state.error?.message || "An unexpected error occurred in this payment component."}
          </p>
          <div className="stellar-ui-error-boundary-actions">
            <button
              type="button"
              className="stellar-ui-btn stellar-ui-btn-secondary"
              onClick={this.handleRetry}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
