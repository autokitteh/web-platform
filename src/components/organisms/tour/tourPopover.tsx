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
		console.log(`[TOUR-DEBUG] Starting effect for targetId: ${targetId}`);
		console.log(`[TOUR-DEBUG] Previous targetId: ${previousTargetIdRef.current}`);

		// Clean up previous element if targetId changed
		if (previousTargetIdRef.current && previousTargetIdRef.current !== targetId) {
			console.log(`[TOUR-DEBUG] Cleaning up previous highlight: ${previousTargetIdRef.current}`);
			cleanupHighlight(previousTargetIdRef.current);
		}
		previousTargetIdRef.current = targetId;

		console.log("targetId", targetId);

		// Special handling for tourStartGmailOauthFlow - this button is on a different page
		if (targetId === "tourStartGmailOauthFlow") {
			console.log(`[TOUR-DEBUG] Special handling for OAuth flow button on new page`);

			// Try finding the element with increased retries
			let retryCount = 0;
			const maxRetries = 30; // More retries for page transition
			const retryInterval = 50; // Longer interval

			const findElementWithRetry = () => {
				const element = document.getElementById(targetId);
				if (element) {
					console.log(`[TOUR-DEBUG] Found OAuth button after ${retryCount} retries`);
					setupHighlightAndPopover(element);
				} else {
					retryCount++;
					if (retryCount < maxRetries) {
						console.log(`[TOUR-DEBUG] Retry ${retryCount}/${maxRetries} finding OAuth button`);
						// Extra diagnostics every 5 attempts
						if (retryCount % 5 === 0) {
							console.log(`[TOUR-DEBUG] Current URL: ${window.location.href}`);
							console.log(`[TOUR-DEBUG] Page title: ${document.title}`);
							// Check form elements
							const forms = document.querySelectorAll("form");
							console.log(`[TOUR-DEBUG] Found ${forms.length} forms on page`);

							// Log all buttons for debugging
							const allButtons = Array.from(document.querySelectorAll("button"));
							console.log(
								`[TOUR-DEBUG] All buttons (first 5):`,
								allButtons.slice(0, 5).map((b) => ({
									id: b.id,
									text: b.textContent?.trim(),
									ariaLabel: b.getAttribute("aria-label"),
									classes: b.className,
								}))
							);
						}
						setTimeout(findElementWithRetry, retryInterval);
					} else {
						console.warn(`[TOUR-DEBUG] Failed to find OAuth button after ${maxRetries} retries`);

						// Last resort - search for other possible targets
						const possibleTargets = [
							document.querySelector('button[type="submit"]'),
							document.querySelector(".submit-btn"),
							document.querySelector("button:has(.external-icon)"),
						].filter(Boolean);

						if (possibleTargets.length > 0) {
							console.log(`[TOUR-DEBUG] Using fallback button as target`);
							const fallbackButton = possibleTargets[0] as HTMLElement;
							fallbackButton.id = targetId;
							setupHighlightAndPopover(fallbackButton);
						} else {
							// Dump all elements with IDs for debugging
							const allElementsWithIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
							console.log(`[TOUR-DEBUG] Available elements with IDs:`, allElementsWithIds);
						}
					}
				}
			};

			// Start search with a delay to account for page transition
			setTimeout(findElementWithRetry, 1000);

			return () => {
				cleanupHighlight(targetId);
			};
		} else if (targetId === "tourProjectGmailConnectionEdit") {
			console.log(`[TOUR-DEBUG] Special handling for gmail connections edit button`);

			let retryCount = 0;
			const maxRetries = 10;
			const retryInterval = 300; // ms

			const findElementWithRetry = () => {
				const element = document.getElementById(targetId);
				if (element) {
					console.log(`[TOUR-DEBUG] Found Gmail connection element after ${retryCount} retries`);

					// Modify the element's click behavior to handle tour navigation
					const originalOnClick = element.onclick;
					element.onclick = (e) => {
						console.log(`[TOUR-DEBUG] Edit button clicked, preparing for next step`);

						// Let the original click handler run and navigate to the next page
						if (originalOnClick) {
							originalOnClick.call(element, e);
						}

						// After navigation and click, move to next step after a delay
						if (onNext) {
							setTimeout(() => {
								console.log(`[TOUR-DEBUG] Moving to OAuth flow step`);
								onNext();
							}, 500);
						}
					};

					setupHighlightAndPopover(element);
				} else {
					retryCount++;
					if (retryCount < maxRetries) {
						console.log(`[TOUR-DEBUG] Retry ${retryCount}/${maxRetries} finding Gmail connection element`);
						setTimeout(findElementWithRetry, retryInterval);
					} else {
						console.warn(
							`[TOUR-DEBUG] Failed to find Gmail connection element after ${maxRetries} retries`
						);
						// Dump all IDs for debugging
						const allElementsWithIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
						console.log(`[TOUR-DEBUG] Available elements with IDs:`, allElementsWithIds);
					}
				}
			};

			// Start retry process
			findElementWithRetry();
			return () => {
				cleanupHighlight(targetId);
			};
		} else {
			// Standard flow for other elements
			const element = document.getElementById(targetId);
			if (!element) {
				console.warn(`[TOUR-DEBUG] Tour target element with id ${targetId} not found`);
				// Let's dump all elements with IDs to help find the issue
				const allElementsWithIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
				console.log(`[TOUR-DEBUG] Available elements with IDs:`, allElementsWithIds);
				return;
			}

			setupHighlightAndPopover(element);

			return () => {
				console.log(`[TOUR-DEBUG] Final cleanup for targetId: ${targetId}`);
				cleanupHighlight(targetId);
			};
		}

		// Function to set up highlight and popover for an element
		function setupHighlightAndPopover(element: HTMLElement) {
			console.log(`[TOUR-DEBUG] Tour element found for ID: ${targetId}`);
			console.log(`[TOUR-DEBUG] Element tag: ${element.tagName}, classes: ${element.className}`);
			console.log(`[TOUR-DEBUG] Element parent: ${element.parentElement?.tagName}`);

			setTarget(element);
			popover.refs.setReference(element);

			if (isHighlighted) {
				// Mark the element as highlighted
				console.log(`[TOUR-DEBUG] Applying highlight to element: ${targetId}`);
				element.dataset.tourHighlight = "true";

				// Store original styles to restore later
				const originalStyles = {
					position: element.style.position,
					zIndex: element.style.zIndex,
					boxShadow: element.style.boxShadow,
					animation: element.style.animation,
				};
				console.log(`[TOUR-DEBUG] Original styles:`, originalStyles);

				// Apply highlight styles
				// element.style.position = "relative";

				// Use higher z-index for OAuth button to ensure it's clickable
				if (targetId === "tourStartGmailOauthFlow") {
					element.style.zIndex = "999"; // Much higher for OAuth button
				} else {
					element.style.zIndex = "60"; // Higher than overlay at 40
				}
				console.log(`[TOUR-DEBUG] Applied z-index: ${element.style.zIndex}`);

				// // Find all parent elements that might create stacking contexts
				// let parent = element.parentElement;
				// const parentsToFix: Array<{ element: HTMLElement; originalPosition: string; originalZIndex: string }> =
				// 	[];
				// let count = 1;

				// while (parent && parent !== document.body) {
				// 	const parentStyle = window.getComputedStyle(parent);
				// 	// Check if parent has styles that might create a stacking context
				// 	if (
				// 		parentStyle.position !== "static" ||
				// 		parentStyle.zIndex !== "auto" ||
				// 		parentStyle.transform !== "none" ||
				// 		parentStyle.filter !== "none" ||
				// 		parentStyle.perspective !== "none"
				// 	) {
				// 		console.log(`[TOUR-DEBUG] Found parent with stacking context:`, {
				// 			tag: parent.tagName,
				// 			id: parent.id,
				// 			class: parent.className,
				// 			position: parentStyle.position,
				// 			zIndex: parentStyle.zIndex,
				// 		});

				// 		parentsToFix.push({
				// 			element: parent,
				// 			originalZIndex: parent.style.zIndex,
				// 			originalPosition: parent.style.position,
				// 		});

				// 		// Set parent z-index high if it's creating a stacking context
				// 		if (parentStyle.position !== "static") {
				// 			parent.style.zIndex = "50"; // Lower than the target but still high
				// 		} else {
				// 			parent.style.position = "relative";
				// 			parent.style.zIndex = "50";
				// 		}
				// 		console.log(`[TOUR-DEBUG] Updated parent style:`, {
				// 			zIndex: parent.style.zIndex,
				// 			position: parent.style.position,
				// 		});
				// 	}
				// 	parent = parent.parentElement;
				// 	if (count === 3) {
				// 		break;
				// 	}
				// 	count++;
				// }

				// In the updateOverlayCutout function:

				const updateOverlayCutout = () => {
					const overlay = document.getElementById("tour-overlay");

					if (
						targetId === "tourStartGmailOauthFlow" ||
						targetId === "tourProjectGmailConnectionEdit" ||
						targetId === "tourProjectConnections"
					) {
						element.style.zIndex = "999"; // Much higher for OAuth button
						element.style.pointerEvents = "auto";

						// Special handling for the connections tab
						if (targetId === "tourProjectConnections") {
							// Add a class to the body to activate special overlay handling
							// document.body.classList.add("tour-connections-active");

							// Get the position of the tab for the cutout
							const rect = element.getBoundingClientRect();

							// Set CSS variables for the mask cutout
							document.documentElement.style.setProperty("--cutout-x", `${rect.left}px`);
							document.documentElement.style.setProperty("--cutout-y", `${rect.top}px`);
							document.documentElement.style.setProperty("--cutout-width", `${rect.width}px`);
							document.documentElement.style.setProperty("--cutout-height", `${rect.height}px`);

							// Position the target connections tab for the tour
							const tabs = document.querySelector(".scrollbar");
							if (tabs) {
								// Find the Connections tab
								const connectionsTab = Array.from(tabs.querySelectorAll(".tracking-wide")).find((el) =>
									el.textContent?.includes("Connections")
								);

								if (connectionsTab) {
									// Make it stand out
									(connectionsTab as HTMLElement).style.zIndex = "999";
									(connectionsTab as HTMLElement).style.position = "relative";
									(connectionsTab as HTMLElement).style.pointerEvents = "auto";
								}
							}
						}
					} else {
						element.style.zIndex = "50"; // Higher than overlay at 40
					}

					if (overlay) {
						overlay.classList.add("tour-overlay-active");
					}
				};

				updateOverlayCutout();

				return () => {
					console.log(`[TOUR-DEBUG] Cleanup effect for targetId: ${targetId}`);

					// Restore original styles
					element.style.position = originalStyles.position;
					element.style.zIndex = originalStyles.zIndex;
					element.style.boxShadow = originalStyles.boxShadow;
					element.style.animation = originalStyles.animation;
					delete element.dataset.tourHighlight;

					// Remove special CSS for connections tab
					if (targetId === "tourProjectConnections") {
						document.body.classList.remove("tour-connections-active");
						document.documentElement.style.removeProperty("--cutout-x");
						document.documentElement.style.removeProperty("--cutout-y");
						document.documentElement.style.removeProperty("--cutout-width");
						document.documentElement.style.removeProperty("--cutout-height");

						// Reset any tab styles
						const tabs = document.querySelector(".scrollbar");
						if (tabs) {
							const connectionsTab = Array.from(tabs.querySelectorAll(".flex.items-center")).find((el) =>
								el.textContent?.includes("Connections")
							);

							if (connectionsTab) {
								(connectionsTab as HTMLElement).style.zIndex = "";
								(connectionsTab as HTMLElement).style.position = "";
								(connectionsTab as HTMLElement).style.pointerEvents = "";
							}
						}
					}
				};
			}
		}
	}, [targetId, isHighlighted, popover.refs, onNext]); // Added onNext to dependencies

	if (!target) return null;

	return (
		<PopoverContext.Provider value={popover}>
			<PopoverContentBase
				className="z-[900] w-80 rounded-lg bg-gray-850 p-4 text-white shadow-lg"
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
							className="h-8 bg-green-500 px-3 text-black hover:bg-green-800"
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
