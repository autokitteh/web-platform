import { HiOutlineOfficeBuilding } from "react-icons/hi";

import { featureFlags } from "@src/constants";
import { MemberRole } from "@src/enums";
import { NavigationSettingsItem } from "@src/interfaces/components";

import { SettingsIcon, SecurityIcon, UserIcon, InvoiceBillIcon } from "@assets/image/icons";
import MagicAiIcon from "@assets/image/icons/ai";

export const aiProjectNavigationItems = {
	aiAssistant: { key: "chatbot", label: "AI", icon: MagicAiIcon, action: "openAiAssistantSidebar" },
	projectConfigSidebar: { key: "settings", label: "Config", icon: SettingsIcon, action: "openConfigSidebar" },
};

export const userMenuItems: NavigationSettingsItem[] = [
	{ icon: UserIcon, label: "myProfile", href: "/settings" },
	{ icon: SecurityIcon, label: "clientConfiguration", href: "/settings/client-configuration", stroke: true },
	{
		icon: HiOutlineOfficeBuilding,
		label: "myOrganizations",
		href: "/settings/organizations",
	},
];

const organizationMenuItems: NavigationSettingsItem[] = [
	{
		icon: SettingsIcon,
		href: "/organization-settings",
		label: "settings",
		stroke: false,
		allowedRoles: [MemberRole.admin],
	},
	{
		icon: UserIcon,
		href: "/organization-settings/members",
		label: "members",
		allowedRoles: [MemberRole.admin, MemberRole.user],
	},
	...(featureFlags.displayBilling
		? [
				{
					icon: InvoiceBillIcon,
					href: "/organization-settings/billing",
					label: "billing",
					allowedRoles: [MemberRole.admin],
				},
			]
		: []),
];

export const getUserMenuOrganizationItems = (role: MemberRole): NavigationSettingsItem[] =>
	organizationMenuItems.filter(({ allowedRoles }) => allowedRoles?.includes(role));
