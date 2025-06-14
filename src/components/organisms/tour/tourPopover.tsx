import React, { useEffect, useRef } from "react";

import { FloatingArrow } from "@floating-ui/react";
import { useTranslation } from "react-i18next";

import { PopoverContext } from "@contexts";
import { EventListenerName } from "@enums";
import { triggerEvent, useEventListener, usePopover } from "@src/hooks";
import { TourPopoverProps } from "@src/interfaces/components";
import { useProjectStore } from "@src/store";
import { cn } from "@src/utilities";

import { Button, IconButton, Typography } from "@components/atoms";
import { PopoverContentBase } from "@components/molecules/popover/popoverContentBase";

import { Close } from "@assets/image/icons";

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
	visible,
	actionButton,
}: TourPopoverProps) => {
	const { t } = useTranslation("tour", { keyPrefix: "popover" });
	const arrowRef = useRef<SVGSVGElement>(null);
	const { actionInProcess } = useProjectStore();
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
				{isLastStep ? null : (
					<IconButton
						ariaLabel={t("skip.ariaLabel")}
						className="group absolute right-2 top-2 ml-auto size-4 bg-gray-400 p-0 hover:bg-gray-950"
						onClick={handleSkip}
					>
						<Close className="size-2 fill-black transition group-hover:fill-white" />
					</IconButton>
				)}
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

				<div className={cn("mt-6 flex justify-between", { "mt-0": hideBack && !actionButton })}>
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
					</div>

					{actionButton ? (
						<Button
							ariaLabel={actionButton.ariaLabel}
							className="h-8 w-auto whitespace-nowrap bg-green-800 px-3 text-sm font-semibold text-gray-1200 hover:bg-green-200"
							disabled={Object.values(actionInProcess).some(Boolean)}
							onClick={actionButton.execute}
							variant="filledGray"
						>
							{actionButton.label}
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
