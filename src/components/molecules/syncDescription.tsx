import React from "react";

import { useTranslation } from "react-i18next";

export const SyncDescription = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });

	return <div>{t("syncDescription")}</div>;
};
