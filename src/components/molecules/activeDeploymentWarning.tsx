import React from "react";

import { useTranslation } from "react-i18next";

import { IconSvg } from "@components/atoms";

import { WarningTriangleIcon } from "@assets/image/icons";

export const ActiveDeploymentWarning = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "shared" });

	return (
		<div className="flex">
			<IconSvg src={WarningTriangleIcon} />
			<div className="mb-4 ml-2 text-white">{t("warningActiveDeployment")}</div>
		</div>
	);
};
