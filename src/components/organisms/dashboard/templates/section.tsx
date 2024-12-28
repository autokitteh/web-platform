import React from "react";

import { useTranslation } from "react-i18next";

import { Frame, IconSvg, Typography } from "@components/atoms";
import { ProjectTemplatesTabs } from "@components/organisms/dashboard/templates";

import { StartTemplateIcon } from "@assets/image/icons";

export const ProjectTemplatesSection = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });

	return (
		<Frame className="h-full rounded-none border-l border-l-gray-750 bg-gray-1250">
			<Typography
				className="mb-7 flex w-full select-none items-center gap-3 font-averta text-3xl font-semibold"
				element="h2"
			>
				<IconSvg className="size-7.5 stroke-white" src={StartTemplateIcon} />

				{t("title")}
			</Typography>

			<ProjectTemplatesTabs />
		</Frame>
	);
};
