import React, { useState } from "react";

import { Controller, FieldErrors, UseFormRegister, useWatch, UseFormClearErrors, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { selectIntegrationLinearActor } from "@src/constants/lists/connections";
import { getApiBaseUrl } from "@src/utilities";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";
import { CopyButton, Select } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const LinearOauthPrivateForm = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
	clearErrors,
}: {
	clearErrors: UseFormClearErrors<FieldValues>;
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const [lockState, setLockState] = useState<{ clientSecret: boolean; webhookSecret: boolean }>({
		clientSecret: true,
		webhookSecret: true,
	});
	const { t } = useTranslation("integrations");

	const clientId = useWatch({ control, name: "private_client_id" });
	const clientSecret = useWatch({ control, name: "private_client_secret" });
	const webhookSecret = useWatch({ control, name: "private_webhook_secret" });
	const apiBaseUrl = getApiBaseUrl();
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Controller
					control={control}
					defaultValue={selectIntegrationLinearActor[0]}
					name="actor"
					render={({ field }) => (
						<Select
							{...field}
							aria-label={t("linear.placeholders.actor")}
							disabled={isLoading}
							isError={!!errors.actor}
							label={t("linear.placeholders.actor")}
							onChange={(selected) => {
								setValue("actor", selected);
								clearErrors("actor");
							}}
							options={selectIntegrationLinearActor}
							placeholder={t("linear.placeholders.actor")}
						/>
					)}
				/>

				<ErrorMessage>{errors.actor?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("private_client_id")}
					aria-label={t("linear.placeholders.clientId")}
					disabled={isLoading}
					isError={!!errors.private_client_id}
					isRequired
					isSensitive
					label={t("linear.placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.private_client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("private_client_secret")}
						aria-label={t("linear.placeholders.clientSecret")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("private_client_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, clientSecret: newLockState }))
						}
						isError={!!errors.private_client_secret}
						isLocked={lockState.clientSecret}
						isRequired
						label={t("linear.placeholders.clientSecret")}
						value={clientSecret}
					/>
				) : (
					<Input
						{...register("private_client_secret")}
						aria-label={t("linear.placeholders.clientSecret")}
						disabled={isLoading}
						isError={!!errors.private_client_secret}
						isRequired
						isSensitive
						label={t("linear.placeholders.clientSecret")}
						value={clientSecret}
					/>
				)}
				<ErrorMessage>{errors.private_client_secret?.message as string}</ErrorMessage>
			</div>
			<div className="relative flex gap-2">
				<Input
					aria-label={t("linear.placeholders.webhookUrl")}
					className="w-full"
					disabled
					label={t("linear.placeholders.webhookUrl")}
					value={`${apiBaseUrl}/linear/event`}
				/>

				<CopyButton size="md" successMessage={t("copySuccess")} text={`${apiBaseUrl}/linear/event`} />
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("private_webhook_secret")}
						aria-label={t("linear.placeholders.webhookSecret")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("private_webhook_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, webhookSecret: newLockState }))
						}
						isError={!!errors.private_webhook_secret}
						isLocked={lockState.webhookSecret}
						label={t("linear.placeholders.webhookSecret")}
						value={webhookSecret}
					/>
				) : (
					<Input
						{...register("private_webhook_secret")}
						aria-label={t("linear.placeholders.webhookSecret")}
						disabled={isLoading}
						isError={!!errors.private_webhook_secret}
						isSensitive
						label={t("linear.placeholders.webhookSecret")}
						value={webhookSecret}
					/>
				)}
				<ErrorMessage>{errors.private_webhook_secret?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <ExternalLinkIcon className="size-4 fill-white transition" />}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
