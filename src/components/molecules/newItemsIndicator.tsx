import React from "react";

import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { ArrowUpIcon, ArrowDown } from "@assets/image/icons";

export interface NewItemsIndicatorProps {
	count: number;
	direction: "top" | "bottom";
	isVisible: boolean;
	onJump: () => void;
	onShow?: () => void;
	className?: string;
	maxDisplayCount?: number;
}

export const NewItemsIndicator = ({
	count,
	direction,
	isVisible,
	onJump,
	onShow,
	className,
	maxDisplayCount = 99,
}: NewItemsIndicatorProps) => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions.autoRefresh" });

	const displayCount = count > maxDisplayCount ? `${maxDisplayCount}+` : count;
	const ArrowIcon = direction === "top" ? ArrowUpIcon : ArrowDown;

	const positionClass = cn({
		"top-2": direction === "top",
		"bottom-2": direction === "bottom",
	});

	const containerClass = cn(
		"absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-2",
		"rounded-full bg-green-800 px-3 py-1.5 shadow-lg",
		"text-sm font-medium text-gray-1100",
		positionClass,
		className
	);

	return (
		<AnimatePresence>
			{isVisible && count > 0 ? (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className={containerClass}
					exit={{ opacity: 0, y: direction === "top" ? -10 : 10 }}
					initial={{ opacity: 0, y: direction === "top" ? -10 : 10 }}
					transition={{ duration: 0.2 }}
				>
					<span>
						{displayCount} {count === 1 ? t("newItem") : t("newItems")}
					</span>
					{onShow ? (
						<Button
							className="rounded-full bg-gray-1100 px-2 py-0.5 text-xs text-white hover:bg-gray-1050"
							onClick={onShow}
						>
							{t("show")}
						</Button>
					) : null}
					<Button
						className="flex items-center gap-1 rounded-full bg-gray-1100 px-2 py-0.5 text-xs text-white hover:bg-gray-1050"
						onClick={onJump}
					>
						<IconSvg className="size-3 fill-white" size="xs" src={ArrowIcon} />
						{direction === "top" ? t("jumpToTop") : t("jumpToBottom")}
					</Button>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
};
