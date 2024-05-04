import { Projects } from "@assets/image";
import { SidebarHrefMenu } from "@enums/components";
import { MenuItem } from "@interfaces/components";

export const menuItems: MenuItem[] = [
	{
		id: 1,
		icon: Projects,
		name: "My Projects",
		href: `/${SidebarHrefMenu.projects}`,
	},
];
