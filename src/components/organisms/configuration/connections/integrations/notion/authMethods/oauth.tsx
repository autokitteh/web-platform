import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Spinner } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

export const NotionOauthForm = ({ isLoading }: { isLoading: boolean }) => {
	const { t } = useTranslation("integrations");

	return (
		<Button
			aria-label={t("buttons.startOAuthFlow")}
			className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
			disabled={isLoading}
			type="submit"
			variant="outline"
		>
			{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
			{t("buttons.startOAuthFlow")}
		</Button>
	);
};
