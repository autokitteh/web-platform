import React, { useEffect, useId } from "react";

import { cn } from "@src/utilities";

import { Loader } from "@components/atoms";

interface LoadingOverlayProps {
	isLoading: boolean;
	className?: string;
}

export const LoadingOverlay = ({ isLoading, className }: LoadingOverlayProps) => {
	const elementId = `loading-overlay-${useId()}`;
	useEffect(() => {
		const element = document.getElementById(elementId);
		const parentEl = element?.parentElement as HTMLElement;
		if (isLoading && parentEl) parentEl.style.overflow = "hidden";
		return () => {
			if (parentEl) parentEl.style.overflow = "";
		};
	}, [isLoading, elementId]);

	if (!isLoading) return null;

	const overlayClassName = cn("absolute inset-0 z-50 flex items-center justify-center", className);

	return (
		<div className={overlayClassName} id={elementId}>
			<div className="absolute inset-0 bg-gray-700/80" />
			<Loader className="z-50" size="xl" />
		</div>
	);
};
