import React, { FunctionComponent, LazyExoticComponent, SVGProps } from "react";

import { motion } from "motion/react";

import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

interface NavigationButtonProps {
	ariaLabel: string;
	icon:
		| React.ComponentType<SVGProps<SVGSVGElement>>
		| LazyExoticComponent<FunctionComponent<SVGProps<SVGSVGElement>>>;
	id?: string;
	isEventsButton?: boolean;
	isSelected: boolean;
	keyName: string;
	label: string;
	disabled?: boolean;
	onClick: () => void;
	showUnderline?: boolean;
}
export const NavigationButton = ({
	ariaLabel,
	disabled,
	icon,
	id,
	isEventsButton = false,
	isSelected,
	keyName,
	label,
	onClick,
	showUnderline = true,
}: NavigationButtonProps) => {
	const buttonClassName = cn(
		"group relative size-full gap-2 whitespace-nowrap rounded-none bg-transparent p-3.5 text-gray-1500 hover:bg-gray-1050",
		{
			"bg-black font-semibold active text-white": isSelected,
		}
	);
	const iconClassName = cn(
		"group-hover:stroke-green-200 group-hover:text-green-200 group-active:text-green-800",
		{
			"text-green-200": isSelected,
		},
		{
			"stroke-white group-hover:stroke-green-200 h-[1.15rem] w-[1.15rem]": isEventsButton,
		}
	);
	return (
		<Button
			ariaLabel={ariaLabel}
			className={buttonClassName}
			disabled={disabled}
			id={id}
			key={keyName}
			onClick={onClick}
			role="navigation"
			title={ariaLabel}
			variant="filledGray"
		>
			<IconSvg className={iconClassName} size="lg" src={icon} />
			<span className="group-hover:text-white">{label}</span>
			{isSelected && showUnderline ? (
				<motion.div
					className="absolute inset-x-0 -bottom-2 h-2 bg-gray-750"
					layoutId="underline"
					transition={{ type: "spring", stiffness: 300, damping: 30 }}
				/>
			) : null}
		</Button>
	);
};
