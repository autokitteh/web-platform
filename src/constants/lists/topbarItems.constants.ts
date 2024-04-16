import { Build, Deploy, Stats } from "@assets/image";
import { ETopbarButton } from "@enums/components";

export const topbarItems = [
	{
		id: 0,
		icon: Build,
		name: ETopbarButton.build,
		disabled: false,
	},
	{
		id: 1,
		icon: Deploy,
		name: ETopbarButton.deploy,
		disabled: false,
	},
	{
		id: 2,
		icon: Stats,
		name: ETopbarButton.viewStats,
		href: "/app/stats",
		disabled: true,
	},
];
