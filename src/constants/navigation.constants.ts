import { AssetsIcon, DeploymentsIcon, GearIcon, ReceiptIcon, SessionsIcon, UserIcon } from "@assets/image/icons";

export const mainNavigationItems = [
	{ key: "assets", label: "Assets", icon: AssetsIcon, path: "/code" },
	{ key: "deployments", label: "Deployments", icon: DeploymentsIcon, path: "/deployments" },
	{ key: "sessions", label: "Sessions", icon: SessionsIcon, path: "/deployments/{deploymentId}/sessions" },
];

export const userMenuOrganizationItems = [
	{
		icon: GearIcon,
		href: "/organization/settings",
		label: "Settings",
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
