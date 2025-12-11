import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";

import { infoTelegramLinks } from "@constants/lists/connections";
import { IntegrationAddFormProps } from "@interfaces/components";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { telegramBotTokenIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const TelegramIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
	isGlobalConnection,
}: IntegrationAddFormProps) => {
	const { t } = useTranslation("integrations");

	const { createConnection, errors, handleSubmit, isLoading, register } = useConnectionForm(
		telegramBotTokenIntegrationSchema,
		"create",
		undefined,
		isGlobalConnection
	);

	useEffect(() => {
		if (connectionId) {
			createConnection(connectionId, ConnectionAuthType.BotToken, Integrations.telegram);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(triggerParentFormSubmit)}>
			<div className="relative">
				<Input
					{...register("bot_token")}
					aria-label={t("telegram.placeholders.botToken")}
					disabled={isLoading}
					isError={!!errors.bot_token}
					isRequired
					isSensitive
					label={t("telegram.placeholders.botToken")}
				/>

				<ErrorMessage>{errors.bot_token?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoTelegramLinks.map(({ text, url }: { text: string; url: string }, index: number) => (
						<Link
							className="group inline-flex items-center gap-2.5 text-green-800"
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
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="size-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
		</form>
	);
};
