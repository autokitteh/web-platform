import React from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/atoms";

export const HttpNoAuthForm = () => {
	const { t } = useTranslation("integrations");

	return (
		<Button
			ariaLabel={t("buttons.saveConnection")}
			className="ml-auto mt-4 w-fit bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
			type="submit"
			variant="outline"
		>
			{t("buttons.saveConnection")}
		</Button>
	);
};
