import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Loader } from "@components/atoms";

export const HeightOauthForm = ({ isLoading }: { isLoading: boolean }) => {
	const { t } = useTranslation("integrations");

	return (
		<Button
			aria-label={t("buttons.startOAuthFlow")}
			className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
			disabled={isLoading}
			type="submit"
			variant="outline"
		>
			{isLoading ? <Loader size="sm" /> : null}
			{t("buttons.startOAuthFlow")}
		</Button>
	);
};
