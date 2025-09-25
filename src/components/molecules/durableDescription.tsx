import React from "react";

import { useTranslation } from "react-i18next";

export const DurableDescription = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });

	return (
		<div>
			{t("durableDescription.line1")}
			<br />
			{t("durableDescription.line2")}
			<br />
			{t("durableDescription.line3")}
		</div>
	);
};
