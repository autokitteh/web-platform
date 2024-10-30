import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DeploymentStateVariant } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { useConnectionForm } from "@src/hooks";
import { useCacheStore, useModalStore } from "@src/store";
import { discordIntegrationSchema } from "@validations";

import { Button, ErrorMessage, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const DiscordIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState(true);

	const { deployments } = useCacheStore();
	const { openModal } = useModalStore();
	const { errors, handleSubmit, isLoading, onSubmitEdit, register, setValue } = useConnectionForm(
		discordIntegrationSchema,
		"edit"
	);

	const handleFormSubmit = () => {
		if (deployments?.length && deployments[0].state === DeploymentStateVariant.active) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmitEdit();
	};

	return (
		<form className="flex flex-col gap-6" onSubmit={handleSubmit(handleFormSubmit)}>
			<div className="relative">
				<SecretInput
					type="password"
					{...register("botToken")}
					aria-label={t("discord.placeholders.botToken")}
					handleInputChange={(newValue) => setValue("botToken", newValue)}
					handleLockAction={setLockState}
					isError={!!errors.botToken}
					isLocked={lockState}
					isRequired
					label={t("discord.placeholders.botToken")}
				/>

				<ErrorMessage>{errors.botToken?.message as string}</ErrorMessage>
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

			<WarningDeploymentActivetedModal onClick={onSubmitEdit} />
		</form>
	);
};
