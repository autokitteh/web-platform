import { ProjectsIcon } from "@assets/image";
import { SidebarHrefMenu } from "@enums/components";
import { MenuItem } from "@interfaces/components";

export const menuItems: MenuItem[] = [
	{
		id: 1,
		icon: ProjectsIcon,
		name: "My Projects",
		href: `/${SidebarHrefMenu.projects}`,
	},
];
