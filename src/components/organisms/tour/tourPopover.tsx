import React, { useEffect, useRef } from "react";

import { FloatingArrow } from "@floating-ui/react";
import { useTranslation } from "react-i18next";

import { PopoverContext } from "@contexts";
import { EventListenerName } from "@enums";
import { triggerEvent, useEventListener, usePopover } from "@src/hooks";
import { TourPopoverProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Button, Typography } from "@components/atoms";
import { PopoverContentBase } from "@components/molecules/popover/popoverContentBase";

export const TourPopover = ({
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
	visible,
}: TourPopoverProps) => {
	const { t } = useTranslation("tour", { keyPrefix: "popover" });
	const arrowRef = useRef<SVGSVGElement>(null);

	const { ...popover } = usePopover({
		placement,
		initialOpen: false,
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

	useEventListener(EventListenerName.configTourPopoverRef, (event: CustomEvent<HTMLElement>) => {
		popover.setOpen(true);
		popover.refs.setReference(event.detail);
		popover.update?.();
	});

	useEffect(() => {
		if (!visible) return;
		triggerEvent(EventListenerName.tourPopoverReady);
	}, [visible]);

	const handleSkip = () => {
		onSkip?.();
	};

	const popoverClassName = cn("z-[100] w-80 rounded-lg bg-gray-850 p-4 text-white shadow-lg", { hidden: !visible });

	return (
		<PopoverContext.Provider value={popover}>
			<PopoverContentBase
				className={popoverClassName}
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
