import React, { useEffect } from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const AuthTokenTwilioForm = ({
	control,
	errors,
	isLoading,
	patWebhookKey,
	register,
	setValue,
}: {
	control: any;
	errors: FieldErrors<any>;
	isLoading: boolean;
	patWebhookKey?: string;
	register: UseFormRegister<{ [key: string]: any }>;
	setValue: (name: string, value: any) => void;
}) => {
	const { t } = useTranslation("integrations");

	const accountSid = useWatch({ control, name: "account_sid" });
	const authToken = useWatch({ control, name: "auth_token" });

	useEffect(() => {
		if (patWebhookKey) {
			setValue("webhook", patWebhookKey);
		}
	}, [patWebhookKey, setValue]);

	return (
		<>
			<div className="relative">
				<Input
					{...register("account_sid")}
					aria-label={t("twilio.placeholders.sid")}
					isError={!!errors.account_sid}
					isRequired
					label={t("twilio.placeholders.sid")}
					onChange={(newValue) => setValue("account_sid", newValue)}
					value={accountSid}
				/>
				<ErrorMessage>{errors.account_sid?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("auth_token")}
					aria-label={t("twilio.placeholders.token")}
					isError={!!errors.auth_token}
					isRequired
					label={t("twilio.placeholders.token")}
					onChange={(newValue) => setValue("auth_token", newValue)}
					value={authToken}
				/>
				<ErrorMessage>{errors.auth_token?.message as string}</ErrorMessage>
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
