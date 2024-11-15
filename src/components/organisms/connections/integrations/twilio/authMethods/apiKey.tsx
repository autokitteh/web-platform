import React from "react";

import { FieldErrors, UseFormRegister, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoTwilioLinks } from "@constants/lists/connections";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const ApiKeyTwilioForm = ({
	control,
	errors,
	isLoading,
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

	const accountSid = useWatch({ control, name: "account_sid" });
	const apiKey = useWatch({ control, name: "api_key" });
	const apiSecret = useWatch({ control, name: "api_secret" });

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
					{...register("api_key")}
					aria-label={t("twilio.placeholders.key")}
					isError={!!errors.api_key}
					isRequired
					label={t("twilio.placeholders.key")}
					onChange={(newValue) => setValue("api_key", newValue)}
					value={apiKey}
				/>
				<ErrorMessage>{errors.api_key?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("api_secret")}
					aria-label={t("twilio.placeholders.secret")}
					isError={!!errors.api_secret}
					isRequired
					label={t("twilio.placeholders.secret")}
					onChange={(newValue) => setValue("api_secret", newValue)}
					value={apiSecret}
				/>
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
