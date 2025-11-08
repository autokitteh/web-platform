import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, ErrorMessage, Input, SecretInput, Spinner } from "@components/atoms";

import { ExternalLinkIcon } from "@assets/image/icons";

export const HeightOauthPrivateForm = ({
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
	const [lockState, setLockState] = useState<{ clientSecret: boolean }>({
		clientSecret: true,
	});
	const { t } = useTranslation("integrations");

	const clientId = useWatch({ control, name: "client_id" });
	const clientSecret = useWatch({ control, name: "client_secret" });

	const isEditMode = mode === "edit";

	return (
		<>
			<div className="relative">
				<Input
					{...register("client_id")}
					aria-label={t("height.placeholders.clientId")}
					disabled={isLoading}
					isError={!!errors.client_id}
					isRequired
					isSensitive
					label={t("height.placeholders.clientId")}
					value={clientId}
				/>
				<ErrorMessage>{errors.client_id?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("client_secret")}
						aria-label={t("height.placeholders.clientSecret")}
						disabled={isLoading}
						handleInputChange={(newValue) => setValue("client_secret", newValue)}
						handleLockAction={(newLockState) =>
							setLockState((prevState) => ({ ...prevState, clientSecret: newLockState }))
						}
						isError={!!errors.client_secret}
						isLocked={lockState.clientSecret}
						isRequired
						label={t("height.placeholders.clientSecret")}
						value={clientSecret}
					/>
				) : (
					<Input
						{...register("client_secret")}
						aria-label={t("height.placeholders.clientSecret")}
						disabled={isLoading}
						isError={!!errors.client_secret}
						isRequired
						isSensitive
						label={t("height.placeholders.clientSecret")}
						value={clientSecret}
					/>
				)}
				<ErrorMessage>{errors.client_secret?.message as string}</ErrorMessage>
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
