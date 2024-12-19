import {
	AssetsIcon,
	DeploymentsIcon,
	GearIcon,
	ReceiptIcon,
	SecurityIcon,
	SessionsIcon,
	UserIcon,
} from "@assets/image/icons";

export const mainNavigationItems = [
	{ key: "assets", label: "Assets", icon: AssetsIcon, path: "/code" },
	{ key: "deployments", label: "Deployments", icon: DeploymentsIcon, path: "/deployments" },
	{ key: "sessions", label: "Sessions", icon: SessionsIcon, path: "/deployments/{deploymentId}/sessions" },
];

export const userMenuItems = [
	{ icon: UserIcon, label: "menu.myProfile", href: "/settings" },
	{ icon: SecurityIcon, label: "menu.clientConfiguration", href: "/settings/client-configuration", stroke: true },
];

export const userMenuOrganizationItems = [
	{
		icon: GearIcon,
		href: "/organization/settings",
		label: "Settings",
		stroke: false,
	},
	{
		icon: UserIcon,
		href: "/organization/users",
		label: "Users",
	},
	{
		icon: ReceiptIcon,
		href: "/organization/billing",
		label: "Billing",
	},
];
