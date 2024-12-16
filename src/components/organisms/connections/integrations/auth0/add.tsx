import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema } from "@validations";

import { Button } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const Auth0IntegrationAddForm = ({
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
			handleOAuth(connectionId, Integrations.auth0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="mt-6 flex flex-col gap-6" onSubmit={triggerParentFormSubmit}>
			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					<Link
						className="inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://docs.autokitteh.com/integrations/auth0/config"
					>
						{t("auth0.configurationGuide")}
						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>
					<Link
						className="inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/oauth2"
					>
						{t("auth0.backgroundConfiguration")}
						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>
				</div>
			</Accordion>

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
