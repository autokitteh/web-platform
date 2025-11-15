import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Button, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const OauthForm = ({ isLoading }: { isLoading: boolean }) => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					<Link
						className="inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://docs.autokitteh.com/integrations/github/config"
					>
						{t("github.akConfigure")}

						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>
					<Link
						className="inline-flex items-center gap-2.5 text-green-800"
						target="_blank"
						to="https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
					>
						{t("github.aboutGitHubApps")}

						<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
					</Link>
				</div>
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
		</>
	);
};
