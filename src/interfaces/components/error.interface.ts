export interface ErrorMessageProps {
	ariaLabel?: string;
	children: React.ReactNode;
	className?: string;
}

export interface ErrorFallbackProps {
	error: Error;
}
