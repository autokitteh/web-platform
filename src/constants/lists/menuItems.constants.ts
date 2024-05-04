import { Connections, Dashboard, Projects, Settings, StatsBlack } from "@assets/image";
import { SidebarHrefMenu } from "@enums/components";
import { MenuItem } from "@interfaces/components";

export const menuItems: MenuItem[] = [
	{
		id: 1,
		icon: Projects,
		name: "My Projects",
		href: `/${SidebarHrefMenu.projects}`,
	},
	{
		id: 2,
		icon: Dashboard,
		name: "Dashboard",
		href: `/${SidebarHrefMenu.dashboard}`,
	},
	{
		id: 3,
		icon: Connections,
		name: "Connections",
		href: `/${SidebarHrefMenu.connections}`,
		submenu: [
			{
				id: 0,
				name: "Slack notification",
				href: "app",
			},
			{
				id: 1,
				name: "AWS monitor",
				href: "app",
			},
			{
				id: 3,
				name: "AK Pagerduty",
				href: "app",
			},
		],
	},
	{
		id: 4,
		icon: StatsBlack,
		name: "Stats",
		href: `/${SidebarHrefMenu.stats}`,
	},
	{
		id: 5,
		icon: Settings,
		name: "Settings",
		href: `/${SidebarHrefMenu.settings}`,
	},
];
