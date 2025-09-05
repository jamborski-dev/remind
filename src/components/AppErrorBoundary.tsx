import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
	errorInfo?: ErrorInfo;
}

/**
 * Top-level error boundary to catch errors from:
 * - Audio/sound playback failures
 * - Wake lock permission issues
 * - Scheduling/timer problems
 * - Other environment-specific failures
 */
export class AppErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): State {
		// Update state so the next render will show the fallback UI
		return {
			hasError: true,
			error,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Log the error for debugging
		console.error("App Error Boundary caught an error:", error, errorInfo);

		this.setState({
			error,
			errorInfo,
		});

		// In production, you might want to send this to an error reporting service
		if (!import.meta.env.DEV) {
			// Example: sendErrorReport(error, errorInfo);
		}
	}

	handleRetry = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	handleReload = () => {
		window.location.reload();
	};

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{
						padding: "2rem",
						textAlign: "center",
						minHeight: "100vh",
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						fontFamily: "system-ui, sans-serif",
						backgroundColor: "#f8f9fa",
					}}
				>
					<div
						style={{
							maxWidth: "600px",
							backgroundColor: "white",
							padding: "2rem",
							borderRadius: "8px",
							boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
						}}
					>
						<h1 style={{ color: "#dc3545", marginBottom: "1rem" }}>
							Something went wrong
						</h1>
						<p style={{ color: "#6c757d", marginBottom: "1.5rem" }}>
							The app encountered an unexpected error. This might be due to
							browser permissions, audio device issues, or other
							environment-specific problems.
						</p>

						<div
							style={{
								marginBottom: "1.5rem",
								display: "flex",
								gap: "1rem",
								justifyContent: "center",
							}}
						>
							<button
								type="button"
								onClick={this.handleRetry}
								style={{
									padding: "0.75rem 1.5rem",
									backgroundColor: "#007bff",
									color: "white",
									border: "none",
									borderRadius: "4px",
									cursor: "pointer",
									fontSize: "1rem",
								}}
							>
								Try Again
							</button>
							<button
								type="button"
								onClick={this.handleReload}
								style={{
									padding: "0.75rem 1.5rem",
									backgroundColor: "#6c757d",
									color: "white",
									border: "none",
									borderRadius: "4px",
									cursor: "pointer",
									fontSize: "1rem",
								}}
							>
								Reload Page
							</button>
						</div>

						{import.meta.env.DEV && this.state.error && (
							<details
								style={{
									marginTop: "1rem",
									padding: "1rem",
									backgroundColor: "#f8f9fa",
									borderRadius: "4px",
									textAlign: "left",
								}}
							>
								<summary style={{ cursor: "pointer", fontWeight: "bold" }}>
									Error Details (Development)
								</summary>
								<pre
									style={{
										marginTop: "1rem",
										padding: "1rem",
										backgroundColor: "#ffffff",
										border: "1px solid #dee2e6",
										borderRadius: "4px",
										fontSize: "0.875rem",
										overflow: "auto",
										whiteSpace: "pre-wrap",
									}}
								>
									{this.state.error.toString()}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
