import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { infoCronExpressionsLinks } from "@constants";

import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const SchedulerInfo = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });

	return (
		<Accordion className="mt-4" title={t("information")}>
			<div className="flex flex-col items-start gap-2">
				{infoCronExpressionsLinks.map(({ additionalText, text, url }, index) => (
					<div key={index}>
						<Link className="inline-flex items-center gap-2.5 text-green-800" target="_blank" to={url}>
							{text}
							<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
						</Link>
						<div className="ml-2 inline">{additionalText}</div>
					</div>
				))}
			</div>
		</Accordion>
	);
};
