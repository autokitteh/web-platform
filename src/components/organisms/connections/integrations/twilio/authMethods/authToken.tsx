import React, { useEffect, useState } from "react";

import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AuthTokenTwilioForm = ({
	errors,
	isLoading,
	mode,
	patWebhookKey,
	register,
	setValue,
}: {
	errors: FieldErrors<any>;
	isLoading: boolean;
	mode: "create" | "edit";
	patWebhookKey?: string;
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}) => {
	const { t } = useTranslation("integrations");
	const [lockState, setLockState] = useState<{ account_sid: boolean; auth_token: boolean }>({
		account_sid: true,
		auth_token: true,
	});
	const isEditMode = mode === "edit";

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
						{...register("account_sid")}
						aria-label={t("twilio.placeholders.sid")}
						handleInputChange={(newSidValue) => setValue("account_sid", newSidValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, account_sid: newLockState }))
						}
						isError={!!errors.account_sid}
						isLocked={lockState.account_sid}
						isRequired
						placeholder={t("twilio.placeholders.sid")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("account_sid")}
						aria-label={t("twilio.placeholders.sid")}
						isError={!!errors.account_sid}
						isRequired
						placeholder={t("twilio.placeholders.sid")}
					/>
				)}

				<ErrorMessage>{errors.account_sid?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				{isEditMode ? (
					<SecretInput
						{...register("auth_token")}
						aria-label={t("twilio.placeholders.token")}
						handleInputChange={(newTokenValue) => setValue("auth_token", newTokenValue)}
						handleLockAction={(newLockState: boolean) =>
							setLockState((prevState) => ({ ...prevState, auth_token: newLockState }))
						}
						isError={!!errors.auth_token}
						isLocked={lockState.auth_token}
						isRequired
						placeholder={t("twilio.placeholders.token")}
						resetOnFirstFocus
					/>
				) : (
					<Input
						{...register("auth_token")}
						aria-label={t("twilio.placeholders.token")}
						isError={!!errors.auth_token}
						isRequired
						placeholder={t("twilio.placeholders.token")}
					/>
				)}

				<ErrorMessage>{errors.auth_token?.message as string}</ErrorMessage>
			</div>

			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-5 w-5 fill-white transition" />}

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

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</>
	);
};
