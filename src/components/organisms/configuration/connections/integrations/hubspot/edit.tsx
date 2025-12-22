import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { useConnectionStore } from "@src/store";
import { legacyOauthSchema } from "@validations";

import { Button, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const HubspotIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId, handleLegacyOAuth, handleSubmit, isLoading, updateConnectionName } = useConnectionForm(
		legacyOauthSchema,
		"edit"
	);
	const { editedConnectionName, originalConnectionName } = useConnectionStore();

	const handleSubmitWithNameUpdate = async () => {
		if (editedConnectionName && editedConnectionName !== originalConnectionName) {
			const nameUpdated = await updateConnectionName(editedConnectionName);
			if (!nameUpdated) {
				return;
			}
		}
		await handleLegacyOAuth(connectionId!, Integrations.hubspot);
	};

	return (
		<form className="mt-6 flex flex-col gap-6" onSubmit={handleSubmit(handleSubmitWithNameUpdate)}>
			<Accordion title={t("information")}>
				<Link
					className="inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://developers.hubspot.com"
				>
					{t("hubspot.hubspotPlatfrom")}
					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

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
		</form>
	);
};
