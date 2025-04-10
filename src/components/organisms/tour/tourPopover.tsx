import React, { useCallback, useEffect, useRef } from "react";

import { FloatingArrow } from "@floating-ui/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { PopoverContext } from "@contexts";
import { EventListenerName } from "@enums";
import { useEventListener, usePopover, triggerEvent } from "@src/hooks";
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
	hideBack,
	onNext,
	displayNext = false,
}: TourPopoverProps) => {
	const { t } = useTranslation("tour", { keyPrefix: "popover" });
	const arrowRef = useRef<SVGSVGElement>(null);
	const { pathname } = useLocation();
	const { ...popover } = usePopover({
		placement,
		initialOpen: true,
		interactionType: "click",
		allowDismiss: false,
		animation: undefined,
		modal: true,
		middlewareConfig: {
			arrow: {
				element: arrowRef as React.MutableRefObject<HTMLElement | null>,
			},
		},
	});

	const handleSkip = () => {
		triggerEvent(EventListenerName.clearTourHighlight);
		onSkip?.();
	};

	const handleElementFound = useCallback(() => {
		const element = document.getElementById(targetId);
		if (element) {
			popover.refs.setReference(element);
		}
	}, [targetId, popover.refs]);

	useEventListener(EventListenerName.tourElementFound, handleElementFound);

	useEffect(() => {
		const element = document.getElementById(targetId);
		if (element) {
			popover.refs.setReference(element);
		}
	}, [targetId, pathname, popover.refs]);

	return (
		<PopoverContext.Provider value={popover}>
			<PopoverContentBase
				className="z-[100] w-80 rounded-lg bg-gray-850 p-4 text-white shadow-lg"
				context={popover}
				floatingContext={popover.context}
				overlayClickDisabled
			>
				{/* Rest of the component remains unchanged */}
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
						{isFirstStep || isLastStep || hideBack ? null : (
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
							onClick={onNext}
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
