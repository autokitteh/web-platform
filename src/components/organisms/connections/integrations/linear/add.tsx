import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema } from "@validations";

import { Button } from "@components/atoms";

export const LinearIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { handleOAuth } = useConnectionForm(oauthSchema, "create");

	useEffect(() => {
		if (connectionId) {
			handleOAuth(connectionId, Integrations.linear);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="mt-6 flex flex-col gap-6" onSubmit={triggerParentFormSubmit}>
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
