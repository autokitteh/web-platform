import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { socialLinks } from "@src/constants";
import { cn } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { Typography } from "@components/atoms/typography";

export const Socials = ({
	fillBlockClass,
	iconsClass,
	titleClass,
	wrapperClass,
}: {
	fillBlockClass?: string;
	iconsClass?: string;
	titleClass?: string;
	wrapperClass?: string;
}) => {
	const { t } = useTranslation("shared", { keyPrefix: "socials" });
	const iconsClassName = cn("fill-gray-500 transition hover:fill-green-800", iconsClass);
	const titleClassName = cn("pr-4 font-averta text-sm font-semibold uppercase", titleClass);
	const wrapperClassName = cn("flex w-full items-center", wrapperClass);
	const fillBlockClassName = cn("h-full", fillBlockClass);

	return (
		<div className="mb-4 flex size-full flex-col items-end">
			<div className={fillBlockClassName} />
			<div className={wrapperClassName}>
				<Typography className={titleClassName} element="h3">
					{t("joinTheCommunity")}
				</Typography>
				<div className="flex flex-wrap gap-2.5">
					{socialLinks.map(({ icon, link, name }) => (
						<Link key={name} target="_blank" title={name} to={link}>
							<IconSvg className={iconsClassName} src={icon} />
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};
