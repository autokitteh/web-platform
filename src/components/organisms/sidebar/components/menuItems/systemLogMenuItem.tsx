import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";

import { sidebarAnimateVariant, SidebarMenuItemProps } from "../sidebar.types";

import { useLoggerStore } from "@store";

import { Badge, Button, IconSvg, Tooltip } from "@components/atoms";

import { FileIcon } from "@assets/image/icons/sidebar";

interface SystemLogMenuItemProps extends SidebarMenuItemProps {
	onClose?: () => void;
}

export const SystemLogMenuItem = ({ isMobile, isOpen, mobileMenuItemClass, onClose }: SystemLogMenuItemProps) => {
	const { t } = useTranslation("sidebar");
	const { isNewLogs, setSystemLogHeight, setNewLogs, lastLogType, systemLogHeight } = useLoggerStore();

	const toggleSystemLogHeight = () => {
		setNewLogs(false);
		setSystemLogHeight(systemLogHeight < 1 ? 20 : 0);
	};

	const handleClick = () => {
		toggleSystemLogHeight();
		onClose?.();
	};

	if (isMobile) {
		return (
			<Button ariaLabel={t("systemLog")} className={mobileMenuItemClass} onClick={handleClick}>
				<Badge
					anchorOrigin={{ vertical: "top", horizontal: "left" }}
					ariaLabel={t("logToReview")}
					isVisible={isNewLogs}
					lastLogType={lastLogType}
					variant="dot"
				>
					<IconSvg className="size-5 fill-gray-1100" src={FileIcon} />
				</Badge>
				<span>{t("systemLog")}</span>
			</Button>
		);
	}

	return (
		<Tooltip content={t("systemLog")} hide={isOpen} position="right">
			<Button
				ariaLabel={t("systemLog")}
				className="w-full p-0 hover:bg-green-200"
				onClick={toggleSystemLogHeight}
			>
				<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
					<Badge
						anchorOrigin={{ vertical: "top", horizontal: "left" }}
						ariaLabel={t("logToReview")}
						className="absolute"
						isVisible={isNewLogs}
						lastLogType={lastLogType}
						variant="dot"
					>
						<IconSvg className="size-5.5 fill-gray-1100 transition" src={FileIcon} />
					</Badge>
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
							{t("systemLog")}
						</motion.span>
					) : null}
				</AnimatePresence>
			</Button>
		</Tooltip>
	);
};
