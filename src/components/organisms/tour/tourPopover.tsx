import React, { useEffect, useRef, useState } from "react";

import { FloatingArrow } from "@floating-ui/react";
import { useTranslation } from "react-i18next";

import { PopoverContext } from "@contexts";
import { usePopover } from "@src/hooks";
import { TourPopoverProps } from "@src/interfaces/components";

import { Button, Typography } from "@components/atoms";
import { PopoverContentBase } from "@components/molecules/popover/popoverContentBase";

export const TourPopover = ({
	targetId,
	title,
	content,
	customComponent,
	placement = "bottom",
	onPrev,
	onSkip,
	isFirstStep,
	isLastStep,
	onNext,
	isHighlighted = true,
	displayNext = false,
}: TourPopoverProps) => {
	const [target, setTarget] = useState<HTMLElement | null>(null);
	const { t } = useTranslation("tour", { keyPrefix: "popover" });
	const arrowRef = useRef<HTMLDivElement>(null);

	const { ...popover } = usePopover({
		placement,
		initialOpen: true,
		interactionType: "click",
		allowDismiss: false,
		modal: false,
		animation: undefined,
		middlewareConfig: {
			arrow: {
				element: arrowRef,
			},
		},
	});

	const cleanupHighlight = (excludeId?: string) => {
		const highlightedElements = document.querySelectorAll('[data-tour-highlight="true"]');
		highlightedElements.forEach((el) => {
			const htmlElement = el as HTMLElement;
			if (excludeId && htmlElement.id === excludeId) return;

			delete htmlElement.dataset.tourHighlight;
			htmlElement.style.removeProperty("position");
			htmlElement.style.removeProperty("z-index");
		});

		const overlay = document.getElementById("tour-overlay");
		if (overlay && !excludeId) {
			overlay.style.background = "rgba(0, 0, 0, 0.5)";
			overlay.style.pointerEvents = "none";
		}
	};

	const handleSkip = () => {
		cleanupHighlight();
		onSkip();
	};

	useEffect(() => {
		cleanupHighlight(targetId);

		const element = document.getElementById(targetId);
		if (!element) return;
		setTarget(element);
		popover.refs.setReference(element);

		const originalPosition = element.style.position;
		const originalZIndex = element.style.zIndex;

		if (isHighlighted) {
			element.dataset.tourHighlight = "true";
			element.style.position = "relative";
			element.style.zIndex = "50";
		}

		const overlay = document.getElementById("tour-overlay");
		if (overlay) {
			const rect = element.getBoundingClientRect();
			const cutoutStyle = `
			radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, 
			transparent ${Math.max(rect.width, rect.height) * 0.6}px, 
			rgba(0, 0, 0, 0.5) ${Math.max(rect.width, rect.height) * 0.6 + 1}px)
		  `;
			if (isHighlighted) {
				overlay.style.background = cutoutStyle;
				overlay.style.pointerEvents = "auto";
			}

			const handleOverlayClick = (e: MouseEvent) => {
				const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
				if (clickedElement !== element && !element.contains(clickedElement)) {
					e.stopPropagation();
				}
			};

			overlay.addEventListener("click", handleOverlayClick);

			return () => {
				overlay.removeEventListener("click", handleOverlayClick);
				if (element && isHighlighted) {
					delete element.dataset.tourHighlight;
					element.style.position = originalPosition;
					element.style.zIndex = originalZIndex;
				}
			};
		}
	}, [targetId, isHighlighted, popover.refs]);

	if (!target) return null;

	return (
		<PopoverContext.Provider value={popover}>
			<PopoverContentBase
				className="z-50 w-80 rounded-lg bg-gray-850 p-4 text-white shadow-lg"
				context={popover}
				floatingContext={popover.context}
				overlayClickDisabled
			>
				{customComponent ? (
					customComponent
				) : (
					<>
						<Typography className="font-semibold" element="h4" size="xl">
							{title}
						</Typography>

						<div className="mt-2 text-sm">{content}</div>
					</>
				)}

				<div className="mt-6 flex justify-between">
					<div className="flex w-3/4 justify-start gap-2">
						{isFirstStep || isLastStep ? null : (
							<Button
								ariaLabel={t("back.ariaLabel")}
								className="h-8 bg-gray-850 px-3 text-xs"
								onClick={onPrev}
								variant="filledGray"
							>
								{t("back.label")}
							</Button>
						)}

						{isLastStep ? null : (
							<Button
								ariaLabel={t("skip.ariaLabel")}
								className="h-8 bg-gray-850 px-3 text-xs"
								onClick={handleSkip}
								variant="filledGray"
							>
								{t("skip.label")}
							</Button>
						)}
					</div>

					{isLastStep ? (
						<Button
							ariaLabel={t("finish.ariaLabel")}
							className="h-8 bg-green-800 px-3 text-sm font-semibold text-gray-1200"
							onClick={handleSkip}
							variant="filledGray"
						>
							{t("finish.label")}
						</Button>
					) : null}
					{displayNext ? (
						<Button
							ariaLabel={t("next.ariaLabel")}
							className="h-8 bg-green-800 px-3 text-sm font-semibold text-gray-1200 hover:bg-green-200"
							onClick={onNext}
							variant="filledGray"
						>
							{t("next.label")}
						</Button>
					) : null}
				</div>

				<FloatingArrow
					className="fill-gray-850"
					context={popover.context}
					height={8}
					ref={arrowRef}
					width={14}
				/>
			</PopoverContentBase>
		</PopoverContext.Provider>
	);
};
