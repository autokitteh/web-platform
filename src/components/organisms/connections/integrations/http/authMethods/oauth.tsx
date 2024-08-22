import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/atoms";

export const HttpOauthForm = () => {
	const { t } = useTranslation("integrations");

	return (
		<Button
			ariaLabel={t("buttons.saveConnection")}
			className="ml-auto w-fit bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
			type="submit"
			variant="outline"
		>
			{t("buttons.saveConnection")}
		</Button>
	);
};
