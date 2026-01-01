import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { LuUnplug } from "react-icons/lu";

import { sidebarAnimateVariant, SidebarMenuItemProps } from "../sidebar.types";
import { featureFlags } from "@constants";

import { Button, Tooltip } from "@components/atoms";

export const ConnectionsMenuItem = ({ isMobile, isOpen, mobileMenuItemClass }: SidebarMenuItemProps) => {
	const { t } = useTranslation("sidebar");

	if (featureFlags.hideOrgConnections) {
		return null;
	}

	if (isMobile) {
		return (
			<Button ariaLabel={t("connections")} className={mobileMenuItemClass} href="/connections">
				<LuUnplug className="size-5 fill-gray-1100" strokeWidth={2} />
				<span>{t("connections")}</span>
			</Button>
		);
	}

	return (
		<Tooltip content={t("connections")} hide={isOpen} position="right">
			<Button ariaLabel={t("connections")} className="mt-3 p-0 hover:bg-green-200" href="/connections">
				<div className="flex size-10 items-center justify-center rounded-full pl-0.5">
					<LuUnplug className="size-5 fill-gray-1100 transition" strokeWidth={2} />
				</div>

				<AnimatePresence>
					{isOpen ? (
						<motion.span
							animate="visible"
							className="-ml-1 overflow-hidden whitespace-nowrap"
							exit="hidden"
							initial="hidden"
							variants={sidebarAnimateVariant}
						>
							{t("connections")}
						</motion.span>
					) : null}
				</AnimatePresence>
			</Button>
		</Tooltip>
	);
};
