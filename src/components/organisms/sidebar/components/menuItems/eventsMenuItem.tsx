import { useTranslation } from "react-i18next";

import { SidebarMenuItem } from "../menuItem";
import { SidebarMenuItemProps } from "../sidebar.types";

import { IconSvg } from "@components/atoms";

import { EventsFlag } from "@assets/image/icons";

export const EventsMenuItem = (props: SidebarMenuItemProps) => {
	const { t } = useTranslation("sidebar");

	return (
		<SidebarMenuItem
			{...props}
			ariaLabel={t("events")}
			className="ml-0.5"
			href="/events"
			icon={EventsFlag}
			label={t("events")}
		>
			<IconSvg className="size-5 fill-gray-1100 transition" src={EventsFlag} />
		</SidebarMenuItem>
	);
};
