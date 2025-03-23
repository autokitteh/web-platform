import React, { useEffect, useRef, useState } from "react";

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

	const popover = usePopover({
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

	// filepath: /Users/ronenmars/Desktop/dev/web-platform-new/src/components/organisms/tour/tourPopover.tsx
	useEffect(() => {
		const element = document.getElementById(targetId);
		if (!element) return;

		setTarget(element);
		popover.refs.setReference(element);

		if (isHighlighted) {
			element.dataset.tourHighlight = "true";
			element.style.position = "relative";
			element.style.zIndex = "50";

			const updateOverlayCutout = () => {
				const overlay = document.getElementById("tour-overlay");
				if (overlay) {
					const rect = element.getBoundingClientRect();
					const cutoutStyle = `
					radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, 
					transparent ${Math.max(rect.width, rect.height) * 0.6}px, 
					rgba(0, 0, 0, 0.5) ${Math.max(rect.width, rect.height) * 0.6 + 1}px)
				  `;
					overlay.style.background = cutoutStyle;

					// Set pointer-events for the overlay
					overlay.style.pointerEvents = "none"; // Make the entire overlay non-blocking first

					// Create an invisible "blocking" element that covers everything EXCEPT the highlighted element
					// We can achieve this by using the click handler instead of modifying pointer-events
				}
			};

			// Initial update
			updateOverlayCutout();

			// Add resize observer to handle any layout shifts
			const resizeObserver = new ResizeObserver(() => {
				updateOverlayCutout();
			});

			resizeObserver.observe(element);
			window.addEventListener("resize", updateOverlayCutout);

			// Click handler
			const overlay = document.getElementById("tour-overlay");
			if (overlay) {
				// Click handler for the overlay
				const handleOverlayClick = (e: MouseEvent) => {
					const rect = element.getBoundingClientRect();
					const centerX = rect.left + rect.width / 2;
					const centerY = rect.top + rect.height / 2;

					// Calculate distance from click to center of highlighted element
					const clickX = e.clientX;
					const clickY = e.clientY;
					const distance = Math.sqrt(Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2));

					// If click is outside the transparent circle, stop propagation
					if (distance > Math.max(rect.width, rect.height) * 0.6) {
						e.stopPropagation();
					}
				};

				overlay.addEventListener("click", handleOverlayClick);

				return () => {
					overlay.removeEventListener("click", handleOverlayClick);
					resizeObserver.disconnect();
					window.removeEventListener("resize", updateOverlayCutout);
				};
			}
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
						{isFirstStep ? null : (
							<Button
								ariaLabel={t("back.ariaLabel")}
								className="h-8 px-3"
								onClick={onPrev}
								variant="filledGray"
							>
								{t("back.label")}
							</Button>
						)}

						{isLastStep ? null : (
							<Button
								ariaLabel={t("skip.ariaLabel")}
								className="h-8 px-3"
								onClick={onSkip}
								variant="filledGray"
							>
								{t("skip.label")}
							</Button>
						)}
					</div>
					{displayNext ? (
						<Button
							ariaLabel={t("next.ariaLabel")}
							className="h-8 px-3"
							onClick={onNext}
							variant="filledGray"
						>
							{t("next.label")}
						</Button>
					) : null}
				</div>

				<div className="absolute size-3 bg-gray-850" ref={arrowRef} style={popover.arrowStyle} />
			</PopoverContentBase>
		</PopoverContext.Provider>
	);
};
