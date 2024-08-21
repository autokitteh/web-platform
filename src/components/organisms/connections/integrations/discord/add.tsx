import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { discordIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const DiscordIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register } = useConnectionForm(
		{
			botToken: "",
		},
		discordIntegrationSchema,
		"create"
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.BotToken, Integrations.discord);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex w-full flex-col gap-4" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("botToken")}
					aria-label={t("discord.placeholders.botToken")}
					isError={!!errors.botToken}
					isRequired
					placeholder={t("discord.placeholders.botToken")}
				/>

				<ErrorMessage>{errors.botToken?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-5 w-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://discord.com/developers/docs/intro"
				>
					{t("discord.information.devPlatform")}

					<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>
		</form>
	);
};
