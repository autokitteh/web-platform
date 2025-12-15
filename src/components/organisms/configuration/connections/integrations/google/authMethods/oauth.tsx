import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";

import { tourStepsHTMLIds } from "@constants";
import { Integrations } from "@src/enums/components";
import { getIntegrationInfoLinks } from "@src/utilities";

import { Button, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const OauthGoogleForm = ({ isLoading }: { isLoading: boolean }) => {
	const { t } = useTranslation("integrations");
	const infoLinks = useMemo(() => getIntegrationInfoLinks(Integrations.gmail), []);
	return (
		<>
			<Accordion title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoLinks.map(({ text, url }, index) => (
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

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				id={tourStepsHTMLIds.googleOAuth}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
