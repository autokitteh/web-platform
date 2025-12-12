import React, { useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiKeyTwilioForm = ({
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
	const [lockState, setLockState] = useState<{ AccountSID: boolean; Password: boolean; Username: boolean }>({
		AccountSID: true,
		Username: true,
		Password: true,
	});

	const isEditMode = mode === "edit";

	const accountSid = useWatch({ control, name: "AccountSID" });
	const apiKey = useWatch({ control, name: "Username" });
	const apiSecret = useWatch({ control, name: "Password" });

	return (
		<>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("AccountSID")}
						aria-label={t("twilio.placeholders.sid")}
						disabled={isLoading}
						handleInputChange={(newSidValue) => setValue("AccountSID", newSidValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, AccountSID: newLockState }))
						}
						isError={!!errors.AccountSID}
						isLocked={lockState.AccountSID}
						isRequired
						label={t("twilio.placeholders.sid")}
						value={accountSid}
					/>
				) : (
					<Input
						{...register("AccountSID")}
						aria-label={t("twilio.placeholders.sid")}
						disabled={isLoading}
						isError={!!errors.AccountSID}
						isRequired
						isSensitive
						label={t("twilio.placeholders.sid")}
					/>
				)}
				<ErrorMessage>{errors.AccountSID?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("Username")}
						aria-label={t("twilio.placeholders.key")}
						disabled={isLoading}
						handleInputChange={(newKeyValue) => setValue("Username", newKeyValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, Username: newLockState }))
						}
						isError={!!errors.Username}
						isLocked={lockState.Username}
						isRequired
						label={t("twilio.placeholders.key")}
						value={apiKey}
					/>
				) : (
					<Input
						{...register("Username")}
						aria-label={t("twilio.placeholders.key")}
						disabled={isLoading}
						isError={!!errors.Username}
						isRequired
						isSensitive
						label={t("twilio.placeholders.key")}
					/>
				)}
				<ErrorMessage>{errors.Username?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						type="password"
						{...register("Password")}
						aria-label={t("twilio.placeholders.secret")}
						disabled={isLoading}
						handleInputChange={(newSecretValue) => setValue("Password", newSecretValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, Password: newLockState }))
						}
						isError={!!errors.Password}
						isLocked={lockState.Password}
						isRequired
						label={t("twilio.placeholders.secret")}
						value={apiSecret}
					/>
				) : (
					<Input
						{...register("Password")}
						aria-label={t("twilio.placeholders.secret")}
						disabled={isLoading}
						isError={!!errors.Password}
						isRequired
						isSensitive
						label={t("twilio.placeholders.secret")}
					/>
				)}
				<ErrorMessage>{errors.Password?.message as string}</ErrorMessage>
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
