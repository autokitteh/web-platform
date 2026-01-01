import { useTranslation } from "react-i18next";

import { SidebarMenuItem } from "../menuItem";
import { SidebarMenuItemProps } from "../sidebar.types";

import { IconSvg } from "@components/atoms";

import { CircleQuestionIcon } from "@assets/image/icons/sidebar";

export const IntroMenuItem = (props: SidebarMenuItemProps) => {
	const { t } = useTranslation("sidebar");

	return (
		<SidebarMenuItem
			{...props}
			ariaLabel={t("intro")}
			className="ml-0.5"
			href="/intro"
			icon={CircleQuestionIcon}
			label={t("intro")}
		>
			<IconSvg className="size-5.5 transition" src={CircleQuestionIcon} />
		</SidebarMenuItem>
	);
};
