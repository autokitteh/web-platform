import { Connections, Dashboard, NewProject, Projects, Settings, StatsBlack } from "@assets/image";
import { IMenuItem } from "@interfaces/components";

export const menuItems: IMenuItem[] = [
	{
		id: 0,
		icon: NewProject,
		name: "New Project",
		href: "/app/new",
	},
	{
		id: 1,
		icon: Projects,
		name: "My Projects",
		href: "/app/my",
	},
	{
		id: 2,
		icon: Dashboard,
		name: "Dashboard",
		href: "/app/dashboard",
	},
	{
		id: 3,
		icon: Connections,
		name: "Connections",
		href: "/app/connections",
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
				id: 2,
				name: "New Project",
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
		href: "/app/stats",
	},
	{
		id: 5,
		icon: Settings,
		name: "Settings",
		href: "/app/settings",
	},
];
