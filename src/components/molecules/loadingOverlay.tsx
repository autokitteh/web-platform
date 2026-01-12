import React, { useEffect, useId } from "react";

import { useWindowDimensions } from "@hooks/useWindowDimensions";
import { LoadingOverlayProps } from "@interfaces/components";
import { cn } from "@src/utilities";

import { Loader } from "@components/atoms";

export const LoadingOverlay = ({ isLoading, className, message }: LoadingOverlayProps) => {
	const overlayId = useId();
	const elementId = `loading-overlay-${overlayId}`;
	const { getRelativeSize } = useWindowDimensions();

	useEffect(() => {
		const element = document.getElementById(elementId);
		const parentEl = element?.parentElement as HTMLElement;
		if (isLoading && parentEl) parentEl.style.overflow = "hidden";
		return () => {
			if (parentEl) parentEl.style.overflow = "";
		};
	}, [isLoading, elementId]);

	if (!isLoading) return null;

	const overlayClassName = cn("fixed left-0 top-0 z-overlay flex size-full items-center justify-center", className);
	const loaderSize = getRelativeSize("loader");
	const loaderClassName = cn("z-overlay", {
		"-ml-4": loaderSize === "md",
		"-ml-7": loaderSize === "lg",
		"-ml-16": loaderSize === "xl",
	});

	const messageAndSpinnerClassName = cn(
		"z-modal box-border flex flex-col items-center justify-center",
		"p-10 pb-12 sm:p-12 sm:pb-14 xl:p-12 xl:pb-16",
		"w-3/4 lg:w-1/3 2xl:w-1/3 3xl:w-1/4",
		"gap-8 sm:gap-4 lg:gap-12 xl:gap-8 2xl:gap-12",
		{
			"bg-black/60 rounded-3xl": message,
		}
	);

	return (
		<div className={overlayClassName} id={elementId}>
			<div className="absolute inset-0 bg-black/85" />
			<div className={messageAndSpinnerClassName}>
				<div className="xs:text-3xl z-overlay text-xl text-white 2xl:text-2.5xl">{message}</div>
				<Loader className={loaderClassName} size={loaderSize} />
			</div>
		</div>
	);
};
