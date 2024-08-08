import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ConnectionAuthType } from "@src/enums/connections/connectionTypes.enum";

import { Button, Input } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const OauthForm = () => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<Accordion title={t("information")}>
				<Link
					className="text-md inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
				>
					{t("github.aboutGitHubApps")}

					<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

			<p className="mt-2">{t("github.clickButtonInstall")}</p>
			<Input name="connectionAuthType" type="hidden" value={ConnectionAuthType.Oauth} />

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
