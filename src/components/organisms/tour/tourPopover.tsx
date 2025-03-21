import React, { useEffect, useRef, useState } from "react";

import { useFloating, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/react";
import { useTranslation } from "react-i18next";

import { TourPopoverProps } from "@src/interfaces/components";

import { Button, Typography } from "@components/atoms";

export const TourPopover = ({
	targetId,
	title,
	content,
	customComponent,
	placement = "bottom",
	onPrev,
	onSkip,
	isFirstStep,
	onNext,
	isHighlighted = true,
	displayNext = false,
}: TourPopoverProps) => {
	const [target, setTarget] = useState<HTMLElement | null>(null);
	const arrowRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation("tour", { keyPrefix: "popover" });

	const { refs, floatingStyles, middlewareData, update } = useFloating({
		placement,
		middleware: [offset(12), flip(), shift(), arrow({ element: arrowRef })],
	});

	useEffect(() => {
		const element = document.getElementById(targetId);
		if (element) {
			setTarget(element);
			refs.setReference(element);

			if (isHighlighted) {
				element.dataset.tourHighlight = "true";

				element.style.position = "relative";
				element.style.zIndex = "50";

				const overlay = document.getElementById("tour-overlay");
				if (overlay) {
					const rect = element.getBoundingClientRect();
					const cutoutStyle = `
                    radial-gradient(circle at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, 
                    transparent ${Math.max(rect.width, rect.height) * 0.6}px, 
                    rgba(0, 0, 0, 0.5) ${Math.max(rect.width, rect.height) * 0.6 + 1}px)
                `;
					overlay.style.background = cutoutStyle;

					overlay.style.pointerEvents = "auto";
					const handleOverlayClick = (e: MouseEvent) => {
						const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
						if (clickedElement !== element && !element.contains(clickedElement)) {
							e.stopPropagation();
						}
					};
					overlay.addEventListener("click", handleOverlayClick);
				}
			}
		}

		return () => {
			if (element && isHighlighted) {
				delete element.dataset.tourHighlight;
				element.style.zIndex = "";

				const overlay = document.getElementById("tour-overlay");
				if (overlay) {
					overlay.style.background = "rgba(0, 0, 0, 0.5)";
					overlay.style.pointerEvents = "none";
				}
			}
		};
	}, [targetId, isHighlighted, refs]);

	useEffect(() => {
		if (!target) return;

		return autoUpdate(target, refs.floating.current!, update);
	}, [target, update, refs.floating]);

	const staticSide = {
		top: "bottom",
		right: "left",
		bottom: "top",
		left: "right",
	}[placement.split("-")[0]];

	const arrowStyles = middlewareData.arrow
		? {
				left: middlewareData.arrow.x != null ? `${middlewareData.arrow.x}px` : "",
				top: middlewareData.arrow.y != null ? `${middlewareData.arrow.y}px` : "",
				right: "",
				bottom: "",
				[staticSide as string]: "-6px",
			}
		: {};

	if (!target) return null;

	return (
		<div
			className="z-50 w-80 rounded-lg bg-gray-850 p-4 text-white shadow-lg"
			ref={refs.setFloating}
			style={floatingStyles}
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
					{!isFirstStep ? (
						<Button
							ariaLabel={t("back.ariaLabel")}
							className="h-8 px-3"
							onClick={onPrev}
							variant="filledGray"
						>
							{t("back.label")}
						</Button>
					) : null}

					<Button ariaLabel={t("skip.ariaLabel")} className="h-8 px-3" onClick={onSkip} variant="filledGray">
						{t("skip.label")}
					</Button>
				</div>
				{displayNext ? (
					<Button ariaLabel={t("next.ariaLabel")} className="h-8 px-3" onClick={onNext} variant="filledGray">
						{t("next.label")}
					</Button>
				) : null}
			</div>

			<div className="absolute size-3 rotate-45 bg-gray-850" ref={arrowRef} style={arrowStyles} />
		</div>
	);
};
