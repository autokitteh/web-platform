import React from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema } from "@validations";

import { Button } from "@components/atoms";

export const HeightIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const { handleOAuth, handleSubmit } = useConnectionForm(oauthSchema, "edit");

	return (
		<form
			className="mt-6 flex flex-col gap-6"
			onSubmit={handleSubmit(async () => await handleOAuth(connectionId!, Integrations.height))}
		>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</form>
	);
};
