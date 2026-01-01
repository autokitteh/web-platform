export interface SidebarMenuItemProps {
	isMobile: boolean;
	isOpen: boolean;
	mobileMenuItemClass: string;
}

export const sidebarAnimateVariant = {
	hidden: { opacity: 0, width: 0 },
	visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" as const }, width: "auto" },
};
