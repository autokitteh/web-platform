import React, { useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiKeyTwilioForm = ({
	errors,
	isLoading,
	mode,
	register,
	setValue,
}: {
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

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("account_sid")}
						aria-label={t("twilio.placeholders.sid")}
						handleInputChange={(newSidValue) => setValue("account_sid", newSidValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, account_sid: newLockState }))
						}
						isError={!!errors.account_sid}
						isLocked={lockState.account_sid}
						isRequired
						label={t("twilio.placeholders.sid")}
					/>
				) : (
					<Input
						{...register("account_sid")}
						aria-label={t("twilio.placeholders.sid")}
						isError={!!errors.account_sid}
						isRequired
						label={t("twilio.placeholders.sid")}
					/>
				)}

				<ErrorMessage>{errors.account_sid?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("api_key")}
						aria-label={t("twilio.placeholders.key")}
						handleInputChange={(newKeyValue) => setValue("api_key", newKeyValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, api_key: newLockState }))
						}
						isError={!!errors.api_key}
						isLocked={lockState.api_key}
						isRequired
						label={t("twilio.placeholders.key")}
					/>
				) : (
					<Input
						{...register("api_key")}
						aria-label={t("twilio.placeholders.key")}
						isError={!!errors.api_key}
						isRequired
						label={t("twilio.placeholders.key")}
					/>
				)}

				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("api_secret")}
						aria-label={t("twilio.placeholders.secret")}
						handleInputChange={(newSecretValue) => setValue("api_secret", newSecretValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, api_secret: newLockState }))
						}
						isError={!!errors.api_secret}
						isLocked={lockState.api_secret}
						isRequired
						label={t("twilio.placeholders.secret")}
					/>
				) : (
					<Input
						{...register("api_secret")}
						aria-label={t("twilio.placeholders.secret")}
						isError={!!errors.api_secret}
						isRequired
						label={t("twilio.placeholders.secret")}
					/>
				)}

				<ErrorMessage>{errors.api_secret?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto px-3 font-medium"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="size-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
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
		</>
	);
};
