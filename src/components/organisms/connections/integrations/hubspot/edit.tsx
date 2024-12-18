import React from "react";

import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { oauthSchema } from "@validations";

import { Button } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const HubspotIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const { handleOAuth, handleSubmit } = useConnectionForm(oauthSchema, "edit");

	return (
		<form
			className="mt-6 flex flex-col gap-6"
			onSubmit={handleSubmit(async () => await handleOAuth(connectionId!, Integrations.hubspot))}
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
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</form>
	);
};
