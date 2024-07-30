import React from "react";

import { useTranslation } from "react-i18next";

import { Frame, IconSvg, SearchInput, Typography } from "@components/atoms";
import { ProjectTemplatesTabs } from "@components/molecules/dashboard/templates";

import { ArrowZigzagIcon } from "@assets/image/icons";

export const ProjectTemplatesSection = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });

	return (
		<Frame className="w-5/12 rounded-none bg-gray-100">
			<Typography
				className="font-averta-bold flex w-full items-center gap-3 text-3xl font-semibold text-black"
				element="h2"
			>
				<IconSvg size="2xl" src={ArrowZigzagIcon} />

				{t("title")}
			</Typography>

			<SearchInput
				className="my-7 h-16 max-w-550 rounded-3xl bg-transparent"
				placeholder={t("explore")}
				variant="light"
			/>

			<ProjectTemplatesTabs />
		</Frame>
	);
};
