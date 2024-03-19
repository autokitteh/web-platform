import { Build, Deploy, Stats } from "@assets/image";

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
		name: "View Stats",
		href: "/app/stats",
		disabled: true,
	},
];
