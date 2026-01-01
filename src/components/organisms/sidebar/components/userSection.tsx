import { AnimatePresence, motion } from "motion/react";
import Avatar from "react-avatar";

import { sidebarAnimateVariant, SidebarMenuItemProps } from "./sidebar.types";
import { descopeProjectId } from "@constants";

import { useOrganizationStore } from "@store";

import { PopoverWrapper, PopoverContent, PopoverTrigger } from "@components/molecules/popover";
import { UserMenu } from "@components/organisms/sidebar";

interface SidebarUserSectionProps extends Omit<SidebarMenuItemProps, "mobileMenuItemClass"> {
	onOpenFeedbackForm: () => void;
}

export const SidebarUserSection = ({ isMobile, isOpen, onOpenFeedbackForm }: SidebarUserSectionProps) => {
	const { user } = useOrganizationStore();

	if (!descopeProjectId) {
		return null;
	}

	if (isMobile) {
		return (
			<div className="mt-2 flex items-center gap-3 border-t border-gray-200 pt-3">
				<Avatar color="black" name={user?.name} round={true} size="30" />
				<span className="text-sm text-black">{user?.name}</span>
			</div>
		);
	}

	return (
		<PopoverWrapper interactionType="click" placement="right-start">
			<PopoverTrigger>
				<div className="flex w-full items-center p-0">
					<div className="ml-0.5 flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-green-200">
						<Avatar color="black" name={user?.name} round={true} size="25" />
					</div>
					<AnimatePresence>
						{isOpen ? (
							<motion.span
								animate="visible"
								className="ml-2.5 overflow-hidden whitespace-nowrap text-black"
								exit="hidden"
								initial="hidden"
								variants={sidebarAnimateVariant}
							>
								{user?.name}
							</motion.span>
						) : null}
					</AnimatePresence>
				</div>
			</PopoverTrigger>
			<PopoverContent className="min-w-56 rounded-2xl border border-gray-950 bg-white px-3.5 py-2.5 font-averta shadow-2xl">
				<UserMenu openFeedbackForm={onOpenFeedbackForm} />
			</PopoverContent>
		</PopoverWrapper>
	);
};
