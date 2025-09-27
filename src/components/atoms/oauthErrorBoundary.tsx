import React, { Component } from "react";

import { OAuthErrorBoundaryProps, OAuthErrorBoundaryState } from "@interfaces/components";
import { LoggerService } from "@services";

import { OAuthErrorFallback } from "@components/atoms";

export class OAuthErrorBoundary extends Component<OAuthErrorBoundaryProps, OAuthErrorBoundaryState> {
	constructor(props: OAuthErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): OAuthErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		const { onError } = this.props;

		LoggerService.error(
			"OAuth component error",
			`${error.message} - Stack: ${error.stack} - Component Stack: ${errorInfo.componentStack}`,
			true
		);

		onError?.(error, errorInfo);
	}

	resetErrorBoundary = () => {
		this.setState({ hasError: false, error: undefined });
	};

	render() {
		const { hasError, error } = this.state;
		const { fallback, children } = this.props;

		if (hasError) {
			if (fallback) {
				return fallback;
			}

			return <OAuthErrorFallback error={error} resetError={this.resetErrorBoundary} />;
		}

		return children;
	}
}
