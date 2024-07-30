import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Link } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const OauthJiraForm = ({ triggerParentFormSubmit }: { triggerParentFormSubmit: () => void }) => {
	const { t } = useTranslation("integrations");

	return (
		<div>
			<Accordion title={t("information")}>
				<Link
					className="text-md inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/"
				>
					{t("jira.information.oauth")}

					<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

			<p className="mt-2">{t("jira.clickButtonAuthorize")}</p>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				onClick={triggerParentFormSubmit}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);
};
