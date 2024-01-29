import Build from "@assets/topbar/Build.svg?react";
import Deploy from "@assets/topbar/Deploy.svg?react";
import Stats from "@assets/topbar/Stats.svg?react";

export const topbarItems = [
	{
		id: 0,
		icon: Build,
		name: "Build",
		href: "/app/build",
		disabled: false,
	},
	{
		id: 1,
		icon: Deploy,
		name: "Deploy",
		href: "/app/deploy",
		disabled: false,
	},
	{
		id: 2,
		icon: Stats,
		name: "Stats",
		href: "/app/stats",
		disabled: true,
	},
];
