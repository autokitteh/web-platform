import React, { useCallback, useEffect, useRef, useState } from "react";

import { AccordionProps, FrontendProjectValidationIndicatorProps } from "@src/interfaces/components";
import { cn } from "@src/utilities";

import { Button, IconSvg, FrontendProjectValidationIndicator } from "@components/atoms";

import { MinusAccordionIcon, PlusAccordionIcon } from "@assets/image/icons";

export const Accordion = ({
	accordionKey,
	section,
	children,
	classChildren,
	classIcon,
	className,
	classNameButton,
	closeIcon,
	constantIcon,
	openIcon,
	title,
	hideDivider,
	id,
	frontendValidationStatus,
	isOpen: externalIsOpen,
	onToggle,
	componentOnTheRight,
}: AccordionProps) => {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const initialOpenState = useRef<boolean | undefined>(undefined);

	const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

	useEffect(() => {
		if (initialOpenState.current === undefined) {
			initialOpenState.current = isOpen;
		}
	}, [isOpen]);

	const toggleAccordion = useCallback(
		(event: React.MouseEvent | React.KeyboardEvent) => {
			event.preventDefault();
			const newIsOpen = !isOpen;

			if (onToggle) {
				onToggle(newIsOpen);
			} else {
				setInternalIsOpen(newIsOpen);
			}
		},
		[isOpen, onToggle]
	);

	const classDescription = cn(
		"py-3",
		{
			"border-0": hideDivider,
		},
		classChildren
	);
	const classSvgIcon = cn("w-3.5 fill-gray-500 transition group-hover:fill-green-800", classIcon);

	const icon = constantIcon ? (
		<IconSvg className={classSvgIcon} src={constantIcon} />
	) : isOpen ? (
		<IconSvg className={classSvgIcon} src={closeIcon || MinusAccordionIcon} />
	) : (
		<IconSvg className={classSvgIcon} src={openIcon || PlusAccordionIcon} />
	);

	const buttonClass = cn(
		"group flex w-full min-w-0 cursor-pointer flex-row items-center gap-2.5 whitespace-nowrap",
		classNameButton
	);

	const showValidationIndicator = !!frontendValidationStatus?.message?.trim() && !!frontendValidationStatus?.level;
	const indicatorProps = frontendValidationStatus as FrontendProjectValidationIndicatorProps;

	const titleString = typeof title === "string" ? title : (accordionKey ?? "");
	const testId = `${titleString.toLowerCase().replace(/ /g, "-")}-accordion-button`;
	const accordionActionDisplayed = isOpen ? "Close" : "Open";
	const ariaLabel = section ? `${accordionActionDisplayed} ${section} Section` : titleString;
	return (
		<div className={className} key={accordionKey || testId}>
			<div className="mb-2 flex w-full flex-row items-center">
				<Button
					ariaLabel={ariaLabel}
					className="flex min-w-0 flex-1 flex-row items-center p-0 text-white hover:bg-transparent"
					data-testid={testId}
					id={id}
					onClick={toggleAccordion}
					title={titleString}
				>
					<div className={buttonClass}>
						{icon}
						{title}
						{showValidationIndicator ? (
							<div className="mt-0.5">
								<FrontendProjectValidationIndicator {...indicatorProps} />
							</div>
						) : null}
					</div>
				</Button>
				{componentOnTheRight ? <div className="shrink-0">{componentOnTheRight}</div> : null}
			</div>
			{isOpen ? <div className={classDescription}>{children}</div> : null}
		</div>
	);
};
