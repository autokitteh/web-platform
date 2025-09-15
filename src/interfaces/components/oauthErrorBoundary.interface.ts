import { ReactNode } from "react";

export interface OAuthErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export interface OAuthErrorBoundaryState {
	hasError: boolean;
	error?: Error;
}
