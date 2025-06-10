import { featureFlags } from "@src/constants";
import { MemberRole } from "@src/enums";
import { NavigationSettingsItem } from "@src/interfaces/components";

import {
	AssetsIcon,
	DeploymentsIcon,
	GearIcon,
	MyOrganizationsIcon,
	SecurityIcon,
	SessionsIcon,
	UserIcon,
	InvoiceBillIcon,
} from "@assets/image/icons";

export const mainNavigationItems = [
	{ key: "assets", label: "Assets", icon: AssetsIcon, path: "/code" },
	{ key: "deployments", label: "Deployments", icon: DeploymentsIcon, path: "/deployments" },
	{ key: "sessions", label: "Sessions", icon: SessionsIcon, path: "/deployments/{deploymentId}/sessions" },
];

export const userMenuItems: NavigationSettingsItem[] = [
	{ icon: UserIcon, label: "menu.myProfile", href: "/settings" },
	{ icon: SecurityIcon, label: "menu.clientConfiguration", href: "/settings/client-configuration", stroke: true },
	{
		icon: MyOrganizationsIcon,
		label: "menu.myOrganizations",
		href: "/settings/organizations",
	},
];

const organizationMenuItems: NavigationSettingsItem[] = [
	{
		icon: GearIcon,
		href: "/organization-settings",
		label: "Settings",
		stroke: false,
		allowedRoles: [MemberRole.admin],
	},
	{
		icon: UserIcon,
		href: "/organization-settings/members",
		label: "Members",
		allowedRoles: [MemberRole.admin, MemberRole.user],
	},
	...(featureFlags.displayBilling
		? [
				{
					icon: InvoiceBillIcon,
					href: "/organization-settings/billing",
					label: "Billing",
					allowedRoles: [MemberRole.admin],
				},
			]
		: []),
];

export const getUserMenuOrganizationItems = (role: MemberRole): NavigationSettingsItem[] =>
	organizationMenuItems.filter(({ allowedRoles }) => allowedRoles?.includes(role));
