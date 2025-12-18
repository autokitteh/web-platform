import React from "react";

import { useTranslation } from "react-i18next";

import { IconSvg } from "@components/atoms";

import { WarningTriangleIcon } from "@assets/image/icons";

interface OrgConnectionModificationWarningProps {
	mode?: "add" | "edit";
}

export const OrgConnectionModificationWarning = ({ mode = "edit" }: OrgConnectionModificationWarningProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "shared" });

	const message = mode === "add" ? t("warningOrgConnectionAdd") : t("warningOrgConnectionModification");

	return (
		<div className="flex">
			<IconSvg src={WarningTriangleIcon} />
			<div className="mb-6 ml-2 text-white">{message}</div>
		</div>
	);
};
