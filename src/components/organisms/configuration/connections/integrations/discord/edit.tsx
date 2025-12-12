import React, { useState } from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useConnectionForm } from "@src/hooks";
import { discordIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const DiscordIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);

	const { control, errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		discordIntegrationSchema,
		"edit"
	);

	const botToken = useWatch({ control, name: "BotToken" });

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitEdit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("BotToken")}
					aria-label={t("discord.placeholders.botToken")}
					disabled={isLoading}
					handleInputChange={(newValue) => setValue("BotToken", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.BotToken}
					isLocked={lockState}
					isRequired
					label={t("discord.placeholders.botToken")}
					value={botToken}
				/>
				<ErrorMessage>{errors.BotToken?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<Link
					className="group inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://discord.com/developers/docs/intro"
				>
					{t("discord.information.devPlatform")}
					<ExternalLinkIcon className="size-3.5 fill-green-800 duration-200" />
				</Link>
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
