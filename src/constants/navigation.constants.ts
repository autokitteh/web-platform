import { featureFlags } from "@src/constants";
import { MemberRole } from "@src/enums";
import { NavigationSettingsItem } from "@src/interfaces/components";

import {
	AssetsIcon,
	DeploymentsIcon,
	SettingsIcon,
	MyOrganizationsIcon,
	SecurityIcon,
	SessionsIcon,
	UserIcon,
	InvoiceBillIcon,
	EventsFlag,
} from "@assets/image/icons";
import MagicAiIcon from "@assets/image/icons/ai";

export const mainNavigationItems = [
	{ key: "assets", label: "Assets", icon: AssetsIcon, path: "/code" },
	{ key: "deployments", label: "Deployments", icon: DeploymentsIcon, path: "/deployments" },
	{ key: "sessions", label: "Sessions", icon: SessionsIcon, path: "/deployments/{deploymentId}/sessions" },
	{ key: "events", label: "Events", icon: EventsFlag, path: "/events" },
];

export const aiProjectNavigationItems = {
	aiAssistant: { key: "chatbot", label: "AI", icon: MagicAiIcon, action: "openAiAssistantSidebar" },
	projectStatusSidebar: { key: "config", label: "Status", icon: SettingsIcon, action: "openStatusSidebar" },
};

export const userMenuItems: NavigationSettingsItem[] = [
	{ icon: UserIcon, label: "myProfile", href: "/settings" },
	{ icon: SecurityIcon, label: "clientConfiguration", href: "/settings/client-configuration", stroke: true },
	{
		icon: MyOrganizationsIcon,
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
