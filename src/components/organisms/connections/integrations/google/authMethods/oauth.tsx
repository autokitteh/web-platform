import React from "react";

import { useTranslation } from "react-i18next";

import { infoGoogleUserLinks } from "@constants/lists";

import { Button, Link } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const OauthGoogleForm = () => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
			<Accordion title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoGoogleUserLinks.map(({ text, url }, index) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-800"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</>
	);
};