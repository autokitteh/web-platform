import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

import { DesktopSidebar, MobileSidebar } from "./components";
import { descopeProjectId } from "@constants";

import { useWindowDimensions } from "@hooks";
import { useOrganizationStore, useToastStore } from "@store";

const mobileMenuItemClass = "w-full justify-start gap-3 p-2 hover:bg-green-200";

export const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
	const { isMobile } = useWindowDimensions();
	const { user, getEnrichedOrganizations, currentOrganization } = useOrganizationStore();
	const location = useLocation();
	const addToast = useToastStore((state) => state.addToast);

	useEffect(() => {
		setIsOpen(false);
	}, [location.pathname]);

	const loadOrganizations = async () => {
		const { data, error } = await getEnrichedOrganizations();
		if (error || !data) {
			addToast({
				message: "Failed to fetch organizations",
				type: "error",
			});
			return;
		}
	};

	useEffect(() => {
		if (!descopeProjectId) return;
		if (descopeProjectId && user && currentOrganization) {
			loadOrganizations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, currentOrganization]);

	const handleToggle = () => setIsOpen(!isOpen);
	const handleClose = () => setIsOpen(false);
	const handleOpenFeedbackForm = () => setIsFeedbackOpen(true);
	const handleCloseFeedbackForm = () => setIsFeedbackOpen(false);

	const menuItemProps = {
		isMobile,
		isOpen,
		mobileMenuItemClass,
	};

	if (isMobile) {
		return (
			<MobileSidebar
				isOpen={isOpen}
				menuItemProps={menuItemProps}
				onClose={handleClose}
				onOpenFeedbackForm={handleOpenFeedbackForm}
				onToggle={handleToggle}
			/>
		);
	}

	return (
		<DesktopSidebar
			isFeedbackOpen={isFeedbackOpen}
			isOpen={isOpen}
			menuItemProps={menuItemProps}
			onCloseFeedbackForm={handleCloseFeedbackForm}
			onOpenFeedbackForm={handleOpenFeedbackForm}
			onToggle={handleToggle}
		/>
	);
};
