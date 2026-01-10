import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiTokenTwilioForm = ({
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
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ account_sid: boolean; api_key: boolean; api_secret: boolean }>({
		account_sid: true,
		api_key: true,
		api_secret: true,
	});

	const isEditMode = mode === "edit";

	const accountSid = useWatch({ control, name: "account_sid" });
	const apiKey = useWatch({ control, name: "api_key" });
	const apiSecret = useWatch({ control, name: "api_secret" });

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("account_sid")}
						aria-label={t("twilio.placeholders.sid")}
						disabled={isLoading}
						handleInputChange={(newSidValue) => setValue("account_sid", newSidValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, account_sid: newLockState }))
						}
						isError={!!errors.account_sid}
						isLocked={lockState.account_sid}
						isRequired
						label={t("twilio.placeholders.sid")}
						value={accountSid}
					/>
				) : (
					<Input
						{...register("account_sid")}
						aria-label={t("twilio.placeholders.sid")}
						disabled={isLoading}
						isError={!!errors.account_sid}
						isRequired
						isSensitive
						label={t("twilio.placeholders.sid")}
					/>
				)}
				<ErrorMessage>{errors.account_sid?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("api_key")}
						aria-label={t("twilio.placeholders.token")}
						disabled={isLoading}
						handleInputChange={(newKeyValue) => setValue("api_key", newKeyValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, api_key: newLockState }))
						}
						isError={!!errors.api_key}
						isLocked={lockState.api_key}
						isRequired
						label={t("twilio.placeholders.token")}
						value={apiKey}
					/>
				) : (
					<Input
						{...register("api_key")}
						aria-label={t("twilio.placeholders.token")}
						disabled={isLoading}
						isError={!!errors.api_key}
						isRequired
						isSensitive
						label={t("twilio.placeholders.token")}
					/>
				)}
				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("api_secret")}
						aria-label={t("twilio.placeholders.secret")}
						disabled={isLoading}
						handleInputChange={(newSecretValue) => setValue("api_secret", newSecretValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, api_secret: newLockState }))
						}
						isError={!!errors.api_secret}
						isLocked={lockState.api_secret}
						isRequired
						label={t("twilio.placeholders.secret")}
						value={apiSecret}
					/>
				) : (
					<Input
						{...register("api_secret")}
						aria-label={t("twilio.placeholders.secret")}
						disabled={isLoading}
						isError={!!errors.api_secret}
						isRequired
						isSensitive
						label={t("twilio.placeholders.secret")}
					/>
				)}
				<ErrorMessage>{errors.api_secret?.message as string}</ErrorMessage>
			</div>

			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoTwilioLinks.map(({ text, url }, index) => (
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
		</>
	);
};
