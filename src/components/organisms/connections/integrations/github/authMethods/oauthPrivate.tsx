import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, Checkbox, ErrorMessage, Input, SecretInput, Spinner, Textarea } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

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
	const appName = useWatch({ control, name: "app_name" });

	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("github.placeholders.clientId")}
					disabled={isLoading}
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
						disabled={isLoading}
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
						disabled={isLoading}
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
					disabled={isLoading}
					isError={!!errors.app_id}
					isRequired
					label={t("github.placeholders.appId")}
					value={appId}
				/>
				<ErrorMessage>{errors.app_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("app_name")}
					aria-label={t("github.placeholders.appName")}
					disabled={isLoading}
					isError={!!errors.app_name}
					isRequired
					label={t("github.placeholders.appName")}
					value={appName}
				/>
				<ErrorMessage>{errors.app_name?.message as string}</ErrorMessage>
			</div>
			{isEditMode ? (
				<SecretInput
					type="password"
					{...register("webhook_secret")}
					aria-label={t("github.placeholders.webhookSercet")}
					disabled={isLoading}
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
					disabled={isLoading}
					label={t("github.placeholders.webhookSercet")}
					value={webhookSecret}
				/>
			)}

			<Input
				{...register("enterprise_url")}
				aria-label={t("github.placeholders.enterpriseUrl")}
				disabled={isLoading}
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
						disabled={isLoading}
						isError={!!errors.private_key}
						isRequired
						label={t("github.placeholders.privateKey")}
						value={privateKey}
					/>
				) : null}
				<ErrorMessage>{errors.private_key?.message as string}</ErrorMessage>
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
