import React from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Typography } from "@components/atoms/typography";

import { DiscordNoColorIcon, GithubIntroIcon, LinkedInIntroIcon, RedditIntroIcon } from "@assets/image/icons";

export const Socials = () => {
	const { t } = useTranslation("shared", { keyPrefix: "socials" });

	return (
		<div className="flex flex-col">
			<Typography className="pr-4 text-lg font-bold uppercase" element="h3">
				{t("joinTheCommunity")}
			</Typography>
			<Typography className="mt-2 text-base" element="p">
				{t("seeOurCommunity")}
			</Typography>
			<div className="mt-4 flex gap-2.5">
				<Link target="_blank" to="https://www.reddit.com/r/autokitteh">
					<RedditIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
				</Link>
				<Link target="_blank" to="https://www.linkedin.com/company/autokitteh">
					<LinkedInIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
				</Link>
				<Link target="_blank" to="https://discord.gg/UhnJuBarZQ">
					<DiscordNoColorIcon className="size-8 fill-gray-500 transition hover:fill-green-800" />
				</Link>
				<Link target="_blank" to="https://github.com/autokitteh/autokitteh">
					<GithubIntroIcon className="fill-gray-500 transition hover:fill-green-800" />
				</Link>
			</div>
		</div>
	);
};
