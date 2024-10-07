import React from "react";

import { UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoGoogleUserLinks } from "@constants/lists";

import { Button, Input, Link } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const OauthGoogleCalendarForm = ({ register }: { register: UseFormRegister<{ [x: string]: any }> }) => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<div className="relative mb-3">
				<Input
					label={t("google.placeholders.calendarId")}
					{...register("cal_id")}
					aria-label={t("google.placeholders.calendarId")}
					placeholder={t("google.placeholders.calendarId")}
				/>
			</div>
			<Button aria-label={t("buttons.startOAuthFlow")} className="ml-auto px-3" type="submit" variant="outline">
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
