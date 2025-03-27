import React, { useEffect, useId } from "react";

import { cn } from "@src/utilities";

import { Loader } from "@components/atoms";

interface LoadingOverlayProps {
	isLoading: boolean;
	className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, className }) => {
	const elementId = useId();
	useEffect(() => {
		if (isLoading) {
			// Use getElementById instead of querySelector to avoid CSS selector issues
			const element = document.getElementById(elementId);
			const parentEl = element?.parentElement as HTMLElement;
			if (parentEl) {
				parentEl.style.overflow = "hidden";
			}
		}

		return () => {
			// Also use getElementById in the cleanup function
			const element = document.getElementById(elementId);
			const parentEl = element?.parentElement as HTMLElement;
			if (parentEl) {
				parentEl.style.overflow = "";
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	if (!isLoading) return null;

	const overlayClassName = cn("absolute inset-0 z-40 flex items-center justify-center", className);

	return (
		<div className={overlayClassName} id={elementId}>
			<div className="absolute inset-0 bg-gray-700/80" />
			<Loader className="z-50" size="xl" />
		</div>
	);
};
