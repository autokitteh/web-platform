import { Connections, Dashboard, Projects, Settings, StatsBlack } from "@assets/image";
import { IMenuItem } from "@interfaces/components";

export const menuItems: IMenuItem[] = [
	{
		id: 1,
		icon: Projects,
		name: "My Projects",
		href: "my",
	},
	{
		id: 2,
		icon: Dashboard,
		name: "Dashboard",
		href: "dashboard",
	},
	{
		id: 3,
		icon: Connections,
		name: "Connections",
		href: "connections",
		submenu: [
			{
				id: 0,
				name: "Slack notification",
				href: "/app",
			},
			{
				id: 1,
				name: "AWS monitor",
				href: "/app",
			},
			{
				id: 3,
				name: "AK Pagerduty",
				href: "/app",
			},
		],
	},
	{
		id: 4,
		icon: StatsBlack,
		name: "Stats",
		href: "stats",
	},
	{
		id: 5,
		icon: Settings,
		name: "Settings",
		href: "settings",
	},
];
