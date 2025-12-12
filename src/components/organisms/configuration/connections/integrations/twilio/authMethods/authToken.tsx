import React, { useEffect, useState } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AuthTokenTwilioForm = ({
	control,
	errors,
	isLoading,
	mode,
	patWebhookKey,
	register,
	setValue,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	patWebhookKey?: string;
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ AccountSID: boolean; Password: boolean }>({
		AccountSID: true,
		Password: true,
	});
	const isEditMode = mode === "edit";

	const accountSid = useWatch({ control, name: "AccountSID" });
	const authToken = useWatch({ control, name: "Password" });

	useEffect(() => {
		if (patWebhookKey) {
			setValue("webhook", patWebhookKey);
		}
	}, [patWebhookKey, setValue]);

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
						{...register("Password")}
						aria-label={t("twilio.placeholders.token")}
						disabled={isLoading}
						handleInputChange={(newTokenValue) => setValue("Password", newTokenValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, Password: newLockState }))
						}
						isError={!!errors.Password}
						isLocked={lockState.Password}
						isRequired
						label={t("twilio.placeholders.token")}
						value={authToken}
					/>
				) : (
					<Input
						{...register("Password")}
						aria-label={t("twilio.placeholders.token")}
						disabled={isLoading}
						isError={!!errors.Password}
						isRequired
						isSensitive
						label={t("twilio.placeholders.token")}
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
