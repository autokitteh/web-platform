import React, { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { githubIntegrationAuthMethods, infoGithubLinks } from "@constants/lists";
import { ConnectionFormIds } from "@enums/components";
import { GithubConnectionType } from "@enums/connections";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { SelectOption } from "@interfaces/components";
import { githubIntegrationSchema } from "@validations";

import { Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { Accordion, Select } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GithubIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t } = useTranslation("integrations");

	const {
		copyToClipboard,
		createPatConnection,
		errors,
		handleGithubOAuth,
		handleSubmit,
		isLoading,
		register,
		setValue,
		watch,
		webhookUrl,
	} = useConnectionForm({ pat: "", webhookSecret: "" }, githubIntegrationSchema);

	const selectedConnectionType = watch("selectedConnectionType");

	const renderPATFields = () => (
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
					aria-label={t("github.placeholders.webhookUrl")}
					className="w-full"
					disabled
					placeholder={t("github.placeholders.webhookUrl")}
					value={webhookUrl}
				/>

				<Button
					aria-label={t("buttons.copy")}
					className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
					onClick={() => copyToClipboard(webhookUrl)}
					variant="outline"
				>
					<CopyIcon className="h-3.5 w-3.5 fill-black" />

					{t("buttons.copy")}
				</Button>
			</div>
			<div className="relative">
				<Input
					{...register("webhookSecret")}
					aria-label={t("github.placeholders.webhookSecret")}
					isError={!!errors.webhookSecret}
					isRequired
					placeholder={t("github.placeholders.webhookSecret")}
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
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-950 hover:text-white"
				onClick={triggerParentFormSubmit}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setValue("selectedConnectionType", option as SelectOption);
	};

	useEffect(() => {
		if (connectionId) {
			switch (selectedConnectionType?.value) {
				case GithubConnectionType.Pat:
					createPatConnection(connectionId);
					break;
				case GithubConnectionType.Oauth:
					handleGithubOAuth(connectionId);
					break;
				default:
					break;
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const onSubmit = () => {
		triggerParentFormSubmit();
	};

	return (
		<form className="flex items-start gap-10" id={ConnectionFormIds.createGithub} onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					label={t("placeholders.connectionType")}
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
