import React, { useEffect, useRef, useState } from "react";

import { useFloating, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/react";

import { TourPopoverProps } from "@src/interfaces/components";

import { Button, IconSvg, Typography } from "@components/atoms";

import { CloseXIcon } from "@assets/image/icons";

export const TourPopover = ({
	targetId,
	title,
	content,
	placement = "bottom",
	onPrev,
	onSkip,
	isFirstStep,
	isHighlighted = true,
}: TourPopoverProps) => {
	const [target, setTarget] = useState<HTMLElement | null>(null);
	const arrowRef = useRef<HTMLDivElement>(null);

	const { refs, floatingStyles, middlewareData, update } = useFloating({
		placement,
		middleware: [offset(12), flip(), shift(), arrow({ element: arrowRef })],
	});

	// Find target element and apply highlights
	useEffect(() => {
		const element = document.getElementById(targetId);
		if (element) {
			setTarget(element);
			refs.setReference(element);

			if (isHighlighted) {
				element.dataset.tourHighlight = "true";
			}
		}

		return () => {
			if (element && isHighlighted) {
				delete element.dataset.tourHighlight;
			}
		};
	}, [targetId, isHighlighted, refs]);

	// Auto-update position
	useEffect(() => {
		if (!target) return;

		return autoUpdate(target, refs.floating.current!, update);
	}, [target, update, refs.floating]);

	// Calculate arrow position
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
			className="z-50 w-72 rounded-lg bg-gray-850 p-4 text-white shadow-lg"
			ref={refs.setFloating}
			style={floatingStyles}
		>
			<div className="flex items-start justify-between">
				<Typography className="font-semibold" element="h4" size="xl">
					{title}
				</Typography>

				<Button
					ariaLabel="Skip tour"
					className="p-1 text-gray-400 hover:text-white"
					onClick={onSkip}
					variant="light"
				>
					<IconSvg className="fill-white" size="sm" src={CloseXIcon} />
				</Button>
			</div>

			<div className="mt-2 text-sm">{content}</div>

			<div className="mt-4 flex justify-between">
				<div>
					{!isFirstStep ? (
						<Button ariaLabel="Previous step" className="text-sm" onClick={onPrev} variant="light">
							Back
						</Button>
					) : null}
				</div>
				<div className="flex gap-2">
					<Button
						ariaLabel="Skip tour"
						className="text-sm hover:bg-transparent hover:underline"
						onClick={onSkip}
						variant="light"
					>
						Skip
					</Button>
				</div>
			</div>

			<div className="absolute size-3 rotate-45 bg-gray-850" ref={arrowRef} style={arrowStyles} />
		</div>
	);
};
