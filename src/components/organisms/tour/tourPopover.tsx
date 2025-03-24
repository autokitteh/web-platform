/* eslint-disable no-console */
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
	const previousTargetIdRef = useRef<string | null>(null);

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

	// Function to clean up highlight from an element
	const cleanupHighlight = (elementId: string) => {
		const prevElement = document.getElementById(elementId);
		if (prevElement && prevElement.dataset.tourHighlight === "true") {
			delete prevElement.dataset.tourHighlight;
			prevElement.style.position = "";
			prevElement.style.zIndex = "";
			prevElement.style.boxShadow = "";
			prevElement.style.animation = "";
			console.log(`Cleaned up highlight from previous element: ${elementId}`);
		}
	};

	useEffect(() => {
		// Clean up previous element if targetId changed
		if (previousTargetIdRef.current && previousTargetIdRef.current !== targetId) {
			cleanupHighlight(previousTargetIdRef.current);
		}
		previousTargetIdRef.current = targetId;

		const element = document.getElementById(targetId);
		if (!element) {
			console.warn(`Tour target element with id ${targetId} not found`);
			return;
		}

		console.log(`Tour element found for ID: ${targetId}`);
		setTarget(element);
		popover.refs.setReference(element);

		if (isHighlighted) {
			// Mark the element as highlighted
			element.dataset.tourHighlight = "true";

			// Store original styles to restore later
			const originalStyles = {
				position: element.style.position,
				zIndex: element.style.zIndex,
				boxShadow: element.style.boxShadow,
				animation: element.style.animation,
			};

			// Apply highlight styles
			element.style.position = "relative";
			element.style.zIndex = "999"; // Much higher z-index to ensure it's above everything

			// Find all parent elements and make sure they don't restrict the z-index
			let parent = element.parentElement;
			const parentsToFix = [];

			while (parent && parent !== document.body) {
				const parentStyle = window.getComputedStyle(parent);
				// Check if parent has styles that might create a stacking context
				if (
					parentStyle.position !== "static" ||
					parentStyle.zIndex !== "auto" ||
					parentStyle.transform !== "none" ||
					parentStyle.filter !== "none" ||
					parentStyle.perspective !== "none"
				) {
					parentsToFix.push({
						element: parent,
						originalZIndex: parent.style.zIndex,
						originalPosition: parent.style.position,
					});

					// Set parent z-index high if it's creating a stacking context
					if (parentStyle.position !== "static") {
						parent.style.zIndex = "990"; // High but lower than the target
					} else {
						parent.style.position = "relative";
						parent.style.zIndex = "990";
					}
				}
				parent = parent.parentElement;
			}

			const updateOverlayCutout = () => {
				const overlay = document.getElementById("tour-overlay");
				if (overlay) {
					const rect = element.getBoundingClientRect();
					console.log(`Element position: ${rect.left}, ${rect.top}, ${rect.width}, ${rect.height}`);

					// Create a visual cutout effect
					const cutoutStyle = `
				radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, 
				transparent ${Math.max(rect.width, rect.height) * 0.6}px, 
				rgba(0, 0, 0, 0.5) ${Math.max(rect.width, rect.height) * 0.6 + 1}px)
			  `;
					overlay.style.background = cutoutStyle;

					// Make sure overlay doesn't capture clicks where we want the element to be clickable
					overlay.style.pointerEvents = "none";
				}
			};

			updateOverlayCutout();
			setTimeout(updateOverlayCutout, 100);

			// Set up observers for layout changes
			const resizeObserver = new ResizeObserver(() => {
				console.log("Resize observed, updating overlay");
				updateOverlayCutout();
			});

			resizeObserver.observe(element);
			window.addEventListener("resize", updateOverlayCutout);
			window.addEventListener("scroll", updateOverlayCutout, true);

			// Enhanced cleanup function
			return () => {
				resizeObserver.disconnect();
				window.removeEventListener("resize", updateOverlayCutout);
				window.removeEventListener("scroll", updateOverlayCutout, true);

				// Restore original styles
				element.style.position = originalStyles.position;
				element.style.zIndex = originalStyles.zIndex;
				element.style.boxShadow = originalStyles.boxShadow;
				element.style.animation = originalStyles.animation;
				delete element.dataset.tourHighlight;

				// Restore parent elements
				parentsToFix.forEach((parent) => {
					parent.element.style.zIndex = parent.originalZIndex;
					parent.element.style.position = parent.originalPosition;
				});

				cleanupHighlight(targetId);
			};
		}

		return () => {
			cleanupHighlight(targetId);
		};
	}, [targetId, isHighlighted, popover.refs]);

	if (!target) return null;

	return (
		<PopoverContext.Provider value={popover}>
			<PopoverContentBase
				className="z-50 w-80 rounded-lg bg-gray-850 p-4 text-white shadow-lg"
				context={popover}
				floatingContext={popover.context}
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
