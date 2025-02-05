import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, Checkbox, ErrorMessage, Input, SecretInput, Spinner, Textarea } from "@components/atoms";

export const OauthPrivateForm = ({
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
	const [lockState, setLockState] = useState<{ clientSecret: boolean; privateKey: boolean; webhookSecret: boolean }>({
		clientSecret: true,
		webhookSecret: true,
		privateKey: true,
	});
	const [updatePrivateKey, setUpdatePrivateKey] = useState(false);
	const { t } = useTranslation("integrations");

	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });
	const appId = useWatch({ control, name: "app_id" });
	const webhookSecret = useWatch({ control, name: "webhook_secret" });
	const enterpriseUrl = useWatch({ control, name: "enterprise_url" });
	const privateKey = useWatch({ control, name: "private_key" });

	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("github.placeholders.clientId")}
					isError={!!errors.client_id}
					isRequired
					label={t("github.placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("client_secret")}
						aria-label={t("github.placeholders.clientSecret")}
						handleInputChange={(newValue) => setValue("client_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, clientSecret: newLockState }))
						}
						isError={!!errors.client_secret}
						isLocked={lockState.clientSecret}
						isRequired
						label={t("github.placeholders.clientSecret")}
						value={clientSecret}
					/>
				) : (
					<Input
						{...register("client_secret")}
						aria-label={t("github.placeholders.clientSecret")}
						isError={!!errors.client_secret}
						isRequired
						label={t("github.placeholders.clientSecret")}
						value={clientSecret}
					/>
				)}
				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("app_id")}
					aria-label={t("github.placeholders.appId")}
					isError={!!errors.app_id}
					isRequired
					label={t("github.placeholders.appId")}
					value={appId}
				/>
				<ErrorMessage>{errors.app_id?.message as string}</ErrorMessage>
			</div>
			{isEditMode ? (
				<SecretInput
					type="password"
					{...register("webhook_secret")}
					aria-label={t("github.placeholders.webhookSercet")}
					handleInputChange={(newValue) => setValue("webhook_secret", newValue)}
					handleLockAction={(newLockState) =>
						setLockState((prevState) => ({ ...prevState, webhookSecret: newLockState }))
					}
					isLocked={lockState.webhookSecret}
					label={t("github.placeholders.webhookSercet")}
					value={webhookSecret}
				/>
			) : (
				<Input
					{...register("webhook_secret")}
					aria-label={t("github.placeholders.webhookSercet")}
					label={t("github.placeholders.webhookSercet")}
					value={webhookSecret}
				/>
			)}

			<Input
				{...register("enterprise_url")}
				aria-label={t("github.placeholders.enterpriseUrl")}
				label={t("github.placeholders.enterpriseUrl")}
				value={enterpriseUrl}
			/>
			<div className="relative">
				{isEditMode ? (
					<Checkbox
						checked={updatePrivateKey}
						isLoading={false}
						label={t("github.updatePrivateKey")}
						labelClassName="text-md"
						onChange={(value) => setUpdatePrivateKey(value)}
					/>
				) : null}

				{!isEditMode || updatePrivateKey ? (
					<Textarea
						rows={5}
						{...register("private_key")}
						aria-label={t("github.placeholders.privateKey")}
						isError={!!errors.private_key}
						isRequired
						label={t("github.placeholders.privateKey")}
						value={privateKey}
					/>
				) : null}
				<ErrorMessage>{errors.private_key?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.startPrivateOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : null}
				{t("buttons.startPrivateOAuthFlow")}
			</Button>
		</>
	);
};
