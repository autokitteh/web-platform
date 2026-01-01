import { useMemo } from "react";

import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { LuX } from "react-icons/lu";

import { sidebarAnimateVariant } from "./sidebar.types";
import { cn } from "@src/utilities";

import { Button } from "@components/atoms";
import { MenuToggle } from "@components/atoms/menuToggle";

interface SidebarMenuToggleProps {
	isMobile: boolean;
	isOpen: boolean;
	onToggle: () => void;
}

export const SidebarMenuToggle = ({ isMobile, isOpen, onToggle }: SidebarMenuToggleProps) => {
	const { t } = useTranslation("sidebar");
	const btnClassName = useMemo(() => cn("mt-7 w-full p-0 hover:bg-green-200", { "pr-2": isOpen }), [isOpen]);

	if (isMobile && !isOpen) {
		return (
			<Button
				ariaLabel={t("openSidebar")}
				className="p-2 hover:bg-green-200"
				onClick={onToggle}
				title={t("openSidebar")}
			>
				<MenuToggle className="flex w-6 items-center justify-center" isOpen={false} />
			</Button>
		);
	}

	if (isMobile && isOpen) {
		return (
			<motion.button
				aria-label={t("closeSidebar")}
				className="rounded-lg p-2 hover:bg-green-200"
				onClick={onToggle}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<LuX className="size-6 text-gray-700" />
			</motion.button>
		);
	}

	return (
		<Button
			ariaLabel={isOpen ? t("closeSidebar") : t("openSidebar")}
			className={btnClassName}
			onClick={onToggle}
			title={isOpen ? t("closeSidebar") : t("openSidebar")}
		>
			<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
				<MenuToggle className="flex w-6 items-center justify-center" isOpen={isOpen} />
			</div>

			<AnimatePresence>
				{isOpen ? (
					<motion.span
						animate="visible"
						className="-ml-2 overflow-hidden whitespace-nowrap"
						exit="hidden"
						initial="hidden"
						variants={sidebarAnimateVariant}
					>
						{t("closeSidebar")}
					</motion.span>
				) : null}
			</AnimatePresence>
		</Button>
	);
};
