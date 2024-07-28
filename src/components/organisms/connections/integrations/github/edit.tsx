import React from "react";

import { useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods, infoGithubLinks } from "@constants/lists";
import { ConnectionFormIds } from "@enums/components";
import { GithubConnectionType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { githubIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, SecretInput, Select, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GithubIntegrationEditForm = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();

	const {
		control,
		copyToClipboard,
		errors,
		handleGithubOAuth,
		handleSubmit,
		isLoading,
		onSubmit,
		register,
		setValue,
		watch,
		webhookUrl,
	} = useConnectionForm(
		{ pat: "", webhookSecret: "", patIsSecret: true, webhookSecretIsSecret: true },
		githubIntegrationSchema,
		"update"
	);

	const pat = useWatch({ control, name: "pat" });
	const patIsSecret = useWatch({ control, name: "patIsSecret" });
	const webhookSecret = useWatch({ control, name: "webhookSecret" });
	const webhookSecretIsSecret = useWatch({ control, name: "webhookSecretIsSecret" });

	const selectedConnectionType = watch("selectedConnectionType");

	const renderPATFields = () => (
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

	const renderOAuthButton = () => (
		<div>
			<Accordion title={t("information")}>
				<Link
					className="text-md inline-flex items-center gap-2.5 text-green-800"
					target="_blank"
					to="https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
				>
					{t("github.aboutGitHubApps")}

					<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
				</Link>
			</Accordion>

			<p className="mt-2">{t("github.clickButtonInstall")}</p>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
				onClick={() => handleGithubOAuth(connectionId!)}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	return (
		<form className="flex items-start gap-10" id={ConnectionFormIds.createGithub} onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={selectConnectionType}
					options={githubIntegrationAuthMethods}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{selectedConnectionType?.value === GithubConnectionType.Pat ? renderPATFields() : null}

				{selectedConnectionType?.value === GithubConnectionType.Oauth ? renderOAuthButton() : null}
			</div>
		</form>
	);
};
