/* eslint-disable react/destructuring-assignment */
import React, { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { hasError: true, error };
	}
	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// eslint-disable-next-line no-console
		console.error("React Error Boundary caught an error:", error, errorInfo);
		this.setState({ errorInfo });
	}

	render() {
		if (this.state.hasError) {
			return (
				<div>
					<h2>Something went wrong</h2>
					<details style={{ whiteSpace: "pre-wrap" }}>
						{this.state.error
							? typeof this.state.error.toString === "function"
								? this.state.error.toString()
								: JSON.stringify(this.state.error, null, 2)
							: null}
						<br />
						{this.state.errorInfo?.componentStack}
					</details>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
