import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { getApiBaseUrl } from "@src/utilities";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";
import { CopyButton } from "@components/molecules";

export const LinearOauthPrivateForm = ({
	control,
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
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

	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });
	const webhookSecret = useWatch({ control, name: "webhook_secret" });
	const apiBaseUrl = getApiBaseUrl();
	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("linear.placeholders.clientId")}
					isError={!!errors.client_id}
					isRequired
					label={t("linear.placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("client_secret")}
						aria-label={t("linear.placeholders.clientSecret")}
						handleInputChange={(newValue) => setValue("client_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, clientSecret: newLockState }))
						}
						isError={!!errors.client_secret}
						isLocked={lockState.clientSecret}
						isRequired
						label={t("linear.placeholders.clientSecret")}
						value={clientSecret}
					/>
				) : (
					<Input
						{...register("client_secret")}
						aria-label={t("linear.placeholders.clientSecret")}
						isError={!!errors.client_secret}
						isRequired
						label={t("linear.placeholders.clientSecret")}
						value={clientSecret}
					/>
				)}
				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>
			<div className="relative flex gap-2">
				<Input
					aria-label={t("linear.placeholders.webhookUrl")}
					className="w-full"
					disabled
					label={t("linear.placeholders.webhookUrl")}
					value={apiBaseUrl}
				/>

				<CopyButton size="md" successMessage={t("copySuccess")} text={apiBaseUrl} />
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("webhook_secret")}
						aria-label={t("linear.placeholders.webhookSecret")}
						handleInputChange={(newValue) => setValue("webhook_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, webhookSecret: newLockState }))
						}
						isError={!!errors.webhook_secret}
						isLocked={lockState.webhookSecret}
						label={t("linear.placeholders.webhookSecret")}
						value={webhookSecret}
					/>
				) : (
					<Input
						{...register("webhook_secret")}
						aria-label={t("linear.placeholders.webhookSecret")}
						isError={!!errors.webhook_secret}
						label={t("linear.placeholders.webhookSecret")}
						value={webhookSecret}
					/>
				)}
				<ErrorMessage>{errors.webhook_secret?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.startOAuthFlow")}
			</Button>
		</>
	);
};
