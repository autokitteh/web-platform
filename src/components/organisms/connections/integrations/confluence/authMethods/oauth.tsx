import React from "react";

import { useTranslation } from "react-i18next";

import { Button, Link, Loader } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const ConfluenceOauthForm = ({ isLoading }: { isLoading: boolean }) => {
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

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Loader size="sm" /> : null}
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);
};
