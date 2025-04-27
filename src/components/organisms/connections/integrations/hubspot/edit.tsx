import React from "react";

import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Integrations } from "@enums/components";
import { oauthSchema } from "@validations";

import { useConnectionForm } from "@hooks";

import { Button, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const HubspotIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const { handleLegacyOAuth, handleSubmit, isLoading } = useConnectionForm(oauthSchema, "edit");

	return (
		<form
			className="mt-6 flex flex-col gap-6"
			onSubmit={handleSubmit(async () => await handleLegacyOAuth(connectionId!, Integrations.hubspot))}
		>
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
