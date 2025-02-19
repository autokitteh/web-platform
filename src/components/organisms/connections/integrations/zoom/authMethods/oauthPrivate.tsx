import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

export const ZoomOauthPrivateForm = ({
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

	const accountId = useWatch({ control, name: "account_id" });
	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });

	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("account_id")}
					aria-label={t("zoom.placeholders.accountId")}
					isError={!!errors.account_id}
					isRequired
					label={t("zoom.placeholders.accountId")}
					value={accountId}
				/>
				<ErrorMessage>{errors.account_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("zoom.placeholders.clientId")}
					isError={!!errors.client_id}
					isRequired
					label={t("zoom.placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("client_secret")}
						aria-label={t("zoom.placeholders.clientSecret")}
						handleInputChange={(newValue) => setValue("client_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, clientSecret: newLockState }))
						}
						isError={!!errors.client_secret}
						isLocked={lockState.clientSecret}
						isRequired
						label={t("zoom.placeholders.clientSecret")}
						value={clientSecret}
					/>
				) : (
					<Input
						{...register("client_secret")}
						aria-label={t("zoom.placeholders.clientSecret")}
						isError={!!errors.client_secret}
						isRequired
						label={t("zoom.placeholders.clientSecret")}
						value={clientSecret}
					/>
				)}
				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
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
