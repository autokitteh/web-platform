import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/atoms";

export const MicrosoftTeamsOauthForm = () => {
	const { t } = useTranslation("integrations");

	return (
		<Button
			aria-label={t("buttons.startOAuthFlow")}
			className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
			type="submit"
			variant="outline"
		>
			{t("buttons.startOAuthFlow")}
		</Button>
	);
};
