import React from "react";

import { useTranslation } from "react-i18next";

import { Frame, IconSvg, SearchInput, Typography } from "@components/atoms";

import { ArrowZigzagIcon } from "@assets/image/icons";

export const CommunityProjects = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "comunityProjects" });

	return (
		<Frame className="w-1/3 rounded-none bg-gray-black-300">
			<Typography
				className="font-averta-bold flex w-full items-center gap-3 text-3xl font-semibold text-black"
				element="h2"
			>
				<IconSvg size="2xl" src={ArrowZigzagIcon} />

				{t("title")}
			</Typography>

			<SearchInput className="my-7 h-16 rounded-3xl" placeholder="Explore" variant="light" />
		</Frame>
	);
};
