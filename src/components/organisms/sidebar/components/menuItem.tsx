import { ReactNode } from "react";

import { AnimatePresence, motion } from "motion/react";

import { sidebarAnimateVariant, SidebarMenuItemProps } from "./sidebar.types";
import { SvgIconType } from "@interfaces/components/icon.interface";
import { cn } from "@src/utilities";

import { Button, IconSvg, Tooltip } from "@components/atoms";

interface MenuItemProps extends SidebarMenuItemProps {
	ariaLabel: string;
	children?: ReactNode;
	href?: string;
	icon: SvgIconType;
	iconClassName?: string;
	label: string;
	onClick?: () => void;
	className?: string;
}

export const SidebarMenuItem = ({
	ariaLabel,
	children,
	href,
	icon,
	iconClassName = "fill-gray-1100",
	className,
	isMobile,
	isOpen,
	label,
	mobileMenuItemClass,
	onClick,
}: MenuItemProps) => {
	if (isMobile) {
		return (
			<Button ariaLabel={ariaLabel} className={mobileMenuItemClass} href={href} onClick={onClick}>
				{children || <IconSvg className={`size-5 ${iconClassName}`} src={icon} />}
				<span>{label}</span>
			</Button>
		);
	}

	const itemClassName = cn("w-full gap-1.5 p-0.5 hover:bg-green-200", className);

	return (
		<Tooltip content={label} hide={isOpen} position="right">
			<Button ariaLabel={ariaLabel} className={itemClassName} href={href} onClick={onClick}>
				<div className="flex size-9 items-center justify-center">
					{children || <IconSvg className={`size-5 ${iconClassName} transition`} src={icon} />}
				</div>

				<AnimatePresence>
					{isOpen ? (
						<motion.span
							animate="visible"
							className="overflow-hidden whitespace-nowrap"
							exit="hidden"
							initial="hidden"
							variants={sidebarAnimateVariant}
						>
							{label}
						</motion.span>
					) : null}
				</AnimatePresence>
			</Button>
		</Tooltip>
	);
};
