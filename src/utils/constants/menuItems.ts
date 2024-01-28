import NewProject from "@assets/sidebar/NewProject.svg";
import Projects from "@assets/sidebar/Projects.svg";
import Dashboard from "@assets/sidebar/Dashboard.svg";
import Connections from "@assets/sidebar/Connections.svg";
import Stats from "@assets/sidebar/Stats.svg";
import Settings from "@assets/sidebar/Settings.svg";

export const menuItems = [
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
		submenu: [
			{
				id: 0,
				name: "AK Pagerduty",
				href: "/app",
			},
			{
				id: 1,
				name: "Google signup",
				href: "/app",
			},
			{
				id: 2,
				name: "New Project",
				href: "/app",
			},
			{
				id: 3,
				name: "Project name",
				href: "/app",
			},
			{
				id: 4,
				name: "New Project",
				href: "/app",
			},
			{
				id: 5,
				name: "Slack notification",
				href: "/app",
			},
			{
				id: 6,
				name: "AWS monitor",
				href: "/app",
			},
			{
				id: 7,
				name: "New Project",
				href: "/app",
			},
			{
				id: 8,
				name: "Github monitor",
				href: "/app",
			},
			{
				id: 9,
				name: "New Project",
				href: "/app",
			},
			{
				id: 10,
				name: "Pagerduty monitor",
				href: "/app",
			},
			{
				id: 11,
				name: "AWS monitor",
				href: "/app",
			},
		],
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
		icon: Stats,
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
