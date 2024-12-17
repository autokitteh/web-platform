import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Integrations } from "@src/enums/components";
import { useConnectionForm, useEvent } from "@src/hooks";
import { oauthSchema } from "@validations";

import { Button } from "@components/atoms";

export const Auth0IntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const { dispatch: dispacthConnectionInfoLoaded } = useEvent("onConnectionLoaded");
	const { handleOAuth, handleSubmit } = useConnectionForm(oauthSchema, "edit");

	useEffect(() => {
		dispacthConnectionInfoLoaded(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<form
			className="mt-6 flex flex-col gap-6"
			onSubmit={handleSubmit(async () => await handleOAuth(connectionId!, Integrations.auth0))}
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
