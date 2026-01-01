import { Suspense } from "react";

import { SidebarLogo } from "./logo";
import { ConnectionsMenuItem } from "./menuItems/connectionsMenuItem";
import { EventsMenuItem } from "./menuItems/eventsMenuItem";
import { IntroMenuItem } from "./menuItems/introMenuItem";
import { SystemLogMenuItem } from "./menuItems/systemLogMenuItem";
import { SidebarMenuToggle } from "./menuToggle";
import { ProjectsMenu } from "./projectsMenu";
import { SidebarMenuItemProps } from "./sidebar.types";
import { SidebarUserSection } from "./userSection";

import { Loader } from "@components/atoms";

interface MobileSidebarProps {
	isOpen: boolean;
	menuItemProps: SidebarMenuItemProps;
	onClose: () => void;
	onOpenFeedbackForm: () => void;
	onToggle: () => void;
}

export const MobileSidebar = ({ isOpen, menuItemProps, onClose, onOpenFeedbackForm, onToggle }: MobileSidebarProps) => {
	return (
		<Suspense fallback={<Loader isCenter size="lg" />}>
			<div className="fixed left-0 top-0 z-40 flex h-12 w-full items-center justify-between bg-white px-3">
				<SidebarLogo isMobile={true} isOpen={false} />
				<SidebarMenuToggle isMobile={true} isOpen={false} onToggle={onToggle} />
			</div>

			{isOpen ? (
				<>
					<div
						aria-label="Close menu"
						className="fixed inset-0 z-40 bg-black/50"
						onClick={onClose}
						onKeyDown={(e) => e.key === "Escape" && onClose()}
						role="button"
						tabIndex={0}
					/>
					<div className="fixed left-0 top-12 z-50 h-[calc(100vh-3rem)] w-64 overflow-y-auto bg-white shadow-xl">
						<div className="flex h-full flex-col justify-between p-3">
							<div>
								<ProjectsMenu className="mt-2" isOpen={true} />
								<ConnectionsMenuItem {...menuItemProps} isOpen={true} />
							</div>

							<div className="flex flex-col gap-1">
								<EventsMenuItem {...menuItemProps} isOpen={true} />
								<SystemLogMenuItem {...menuItemProps} isOpen={true} onClose={onClose} />
								<IntroMenuItem {...menuItemProps} isOpen={true} />
								<SidebarUserSection
									isMobile={true}
									isOpen={true}
									onOpenFeedbackForm={onOpenFeedbackForm}
								/>
							</div>
						</div>
					</div>
				</>
			) : null}
		</Suspense>
	);
};
