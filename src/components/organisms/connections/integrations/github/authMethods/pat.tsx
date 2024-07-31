import React, { useEffect, useState } from "react";

import randomatic from "randomatic";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoGithubLinks } from "@constants/lists";
import { apiBaseUrl } from "@src/constants";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const PatForm = ({
	copyToClipboard,
	errors,
	isLoading,
	register,
	setValue,
}: {
	copyToClipboard: (webhookUrlPath: string) => void;
	errors: FieldErrors<any>;
	isLoading: boolean;
	register: UseFormRegister<{ [x: string]: any }>;
	setValue: any;
}) => {
	const { t } = useTranslation("integrations");
	const [webhook, setWebhook] = useState("");

	useEffect(() => {
		setWebhook(`${apiBaseUrl}/${randomatic("Aa0", 8)}`);
		setValue("webhook", webhook); // Update the react-hook-form state when webhook changes
	}, []);

	return (
		<>
			<div className="relative">
				<Input
					{...register("pat")}
					aria-label={t("github.placeholders.pat")}
					isError={!!errors.pat}
					isRequired
					placeholder={t("github.placeholders.pat")}
				/>

				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
			</div>
			<div className="relative flex gap-2">
				<Input
					{...register("webhook")}
					aria-label={t("github.placeholders.webhookUrl")}
					className="w-full"
					disabled
					placeholder={t("github.placeholders.webhookUrl")}
					value={webhook}
				/>

				<Button
					aria-label={t("buttons.copy")}
					className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
					onClick={() => copyToClipboard(webhook)}
					variant="outline"
				>
					<CopyIcon className="h-3.5 w-3.5 fill-black" />

					{t("buttons.copy")}
				</Button>
			</div>
			<div className="relative">
				<Input
					{...register("secret")}
					aria-label={t("github.placeholders.secret")}
					isError={!!errors.secret}
					placeholder={t("github.placeholders.secret")}
				/>

				<ErrorMessage>{errors.secret?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				id="connectionForm"
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-5 w-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoGithubLinks.map(({ text, url }, index) => (
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
