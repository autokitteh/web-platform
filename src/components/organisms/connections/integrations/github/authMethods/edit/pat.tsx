import React from "react";

import { FieldErrors } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { infoGithubLinks } from "@constants/lists";
import { ConnectionFormIds } from "@enums/components";

import { Button, ErrorMessage, Input, Link, SecretInput, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const EditPatForm = ({
	copyToClipboard,
	errors,
	isLoading,
	pat,
	patIsSecret,
	register,
	setValue,
	webhookSecret,
	webhookSecretIsSecret,
	webhookUrl,
}: {
	copyToClipboard: (text: string) => void;
	errors: FieldErrors<any>;
	isLoading: boolean;
	pat: string;
	patIsSecret: boolean;
	register: any;
	setValue: any;
	webhookSecret: string;
	webhookSecretIsSecret: boolean;
	webhookUrl: string;
}) => {
	const { t } = useTranslation("integrations");

	return (
		<>
			<div className="relative">
				<SecretInput
					{...register("pat")}
					aria-label={t("github.placeholders.pat")}
					handleInputChange={(newValue) => setValue("pat", newValue)}
					handleLockAction={(newState: boolean) => setValue("patIsSecret", newState)}
					isError={!!errors.pat}
					isLocked={patIsSecret}
					isRequired
					placeholder={t("github.placeholders.pat")}
					value={pat}
				/>

				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
			</div>
			<div className="relative flex gap-2">
				<Input
					aria-label={t("github.placeholders.webhookUrl")}
					className="w-full"
					disabled
					placeholder={t("github.placeholders.webhookUrl")}
					value={webhookUrl}
				/>

				<Button
					aria-label={t("buttons.copy")}
					className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-300"
					onClick={() => copyToClipboard(webhookUrl)}
					variant="outline"
				>
					<CopyIcon className="h-3.5 w-3.5 fill-black" />

					{t("buttons.copy")}
				</Button>
			</div>
			<div className="relative">
				<SecretInput
					{...register("webhookSecret")}
					aria-label={t("github.placeholders.webhookSecret")}
					handleInputChange={(newValue) => setValue("webhookSecret", newValue)}
					handleLockAction={(newState: boolean) => setValue("webhookSecretIsSecret", newState)}
					isError={!!errors.webhookSecret}
					isLocked={webhookSecretIsSecret}
					isRequired
					placeholder={t("github.placeholders.webhookSecret")}
					value={webhookSecret}
				/>

				<ErrorMessage>{errors.webhookSecret?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.saveConnection")}
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				id={ConnectionFormIds.createGithub}
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
