import React, { Component, ErrorInfo, ReactNode } from "react";

import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";

import { Button } from "@components/atoms";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		const { onError } = this.props;

		LoggerService.error(namespaces.errorBoundary, "Error caught by boundary");

		onError?.(error, errorInfo);
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	public render() {
		const { hasError, error } = this.state;
		const { fallback, children } = this.props;

		if (hasError) {
			if (fallback) {
				return fallback;
			}

			return (
				<div className="flex size-full flex-col items-center justify-center bg-gray-1250 p-8">
					<div className="mb-4 text-center">
						<h2 className="mb-2 text-xl font-semibold text-white">Something went wrong</h2>
						<p className="text-gray-400">{error?.message || "An unexpected error occurred"}</p>
					</div>
					<Button
						className="bg-gray-800 text-white hover:bg-gray-700"
						onClick={this.handleRetry}
						variant="outline"
					>
						Try Again
					</Button>
				</div>
			);
		}

		return children;
	}
}
