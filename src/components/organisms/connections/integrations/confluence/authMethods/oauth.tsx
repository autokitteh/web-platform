import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Link } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const ConfluenceOauthForm = () => {
	const { t } = useTranslation("integrations");

	return (
		<div>
			<Accordion title={t("information")}>
				<Link
					className="inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://docs.autokitteh.com/integrations/atlassian/config"
				>
					{t("confluence.information.oauth")}

					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

			<p className="mt-2">{t("confluence.clickButtonAuthorize")}</p>

			<Button aria-label={t("buttons.startOAuthFlow")} className="ml-auto px-3" type="submit" variant="outline">
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);
};
