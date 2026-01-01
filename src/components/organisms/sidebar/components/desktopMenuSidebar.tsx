import { Suspense, useMemo } from "react";

import { SidebarLogo } from "./logo";
import { ConnectionsMenuItem } from "./menuItems/connectionsMenuItem";
import { EventsMenuItem } from "./menuItems/eventsMenuItem";
import { IntroMenuItem } from "./menuItems/introMenuItem";
import { SystemLogMenuItem } from "./menuItems/systemLogMenuItem";
import { SidebarMenuToggle } from "./menuToggle";
import { ProjectsMenu } from "./projectsMenu";
import { SidebarMenuItemProps } from "./sidebar.types";
import { SidebarUserSection } from "./userSection";
import { cn } from "@src/utilities";

import { Loader } from "@components/atoms";
import { UserFeedbackForm } from "@components/organisms";

interface DesktopSidebarProps {
	isFeedbackOpen: boolean;
	isOpen: boolean;
	menuItemProps: SidebarMenuItemProps;
	onCloseFeedbackForm: () => void;
	onOpenFeedbackForm: () => void;
	onToggle: () => void;
}

export const DesktopSidebar = ({
	isFeedbackOpen,
	isOpen,
	menuItemProps,
	onCloseFeedbackForm,
	onOpenFeedbackForm,
	onToggle,
}: DesktopSidebarProps) => {
	const rootClassName = useMemo(
		() => cn("relative z-30 flex h-full items-start", { "z-50": isFeedbackOpen }),
		[isFeedbackOpen]
	);

	return (
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className={rootClassName}>
				<div className="z-10 flex h-full flex-col justify-between bg-white p-2.5 pt-2">
					<div>
						<SidebarLogo isMobile={false} isOpen={isOpen} />
						<SidebarMenuToggle isMobile={false} isOpen={isOpen} onToggle={onToggle} />
						<ProjectsMenu className="mt-5" isOpen={isOpen} />
						<ConnectionsMenuItem {...menuItemProps} />
					</div>

					<div className="flex flex-col gap-2">
						<EventsMenuItem {...menuItemProps} />
						<SystemLogMenuItem {...menuItemProps} />
						<IntroMenuItem {...menuItemProps} />
						<SidebarUserSection isMobile={false} isOpen={isOpen} onOpenFeedbackForm={onOpenFeedbackForm} />
					</div>
					<UserFeedbackForm
						className="absolute bottom-0 left-20"
						isOpen={isFeedbackOpen}
						onClose={onCloseFeedbackForm}
					/>
				</div>
			</div>
		</Suspense>
	);
};
