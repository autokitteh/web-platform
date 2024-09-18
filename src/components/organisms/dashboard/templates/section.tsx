import React from "react";

import { useTranslation } from "react-i18next";

import { Frame, IconSvg, Typography } from "@components/atoms";
import { ProjectTemplatesTabs } from "@components/molecules/dashboard/templates";

import { ArrowRightCircleIcon } from "@assets/image/icons";

export const ProjectTemplatesSection = () => {
	const { t } = useTranslation("dashboard", { keyPrefix: "templates" });

	return (
		<Frame className="w-5/12 rounded-none bg-gray-1250">
			<Typography className="mb-7 flex w-full items-center gap-3 text-3xl font-semibold" element="h2">
				<IconSvg className="stroke-white" size="2xl" src={ArrowRightCircleIcon} />

				{t("title")}
			</Typography>

			<ProjectTemplatesTabs />
		</Frame>
	);
};
