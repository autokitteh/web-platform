import { SecurityIcon, UserIcon } from "@assets/image/icons";

export const menuUserItems = [
	{ icon: UserIcon, label: "menu.myProfile", path: "/settings" },
	{ icon: SecurityIcon, label: "menu.clientConfiguration", path: "/settings/client-configuration", stroke: true },
];
