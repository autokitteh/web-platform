import React, { useEffect, useMemo, useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { integrationVariablesMapping } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { getIntegrationInfoLinks, setFormValues } from "@src/utilities";
import { telegramBotTokenIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const TelegramIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);
	const infoLinks = useMemo(() => getIntegrationInfoLinks(Integrations.telegram), []);

	const { connectionVariables, control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } =
		useConnectionForm(telegramBotTokenIntegrationSchema, "edit");

	const botToken = useWatch({ control, name: "bot_token" });

	useEffect(() => {
		setFormValues(connectionVariables, integrationVariablesMapping.telegram, setValue);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionVariables]);

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("bot_token")}
					aria-label={t("telegram.placeholders.botToken")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("bot_token", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.bot_token}
					isLocked={lockState}
					isRequired
					label={t("telegram.placeholders.botToken")}
					value={botToken}
				/>
				<ErrorMessage>{errors.bot_token?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoLinks.map(({ text, url }, index) => (
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
