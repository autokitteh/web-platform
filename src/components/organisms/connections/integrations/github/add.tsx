import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import randomatic from "randomatic";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { baseUrl, namespaces } from "@constants";
import { githubIntegrationAuthMethods, infoGithubLinks } from "@constants/lists";
import { GithubConnectionType } from "@enums";
import { ConnectionFormIds } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { githubIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Select, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const GithubIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();
	const { projectId } = useParams();
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		resolver: zodResolver(githubIntegrationSchema),
		defaultValues: {
			pat: "",
			webhookSercet: "",
		},
	});

	const randomForPATWebhook = randomatic("Aa0", 8);
	const webhookUrl = `${baseUrl}/${randomForPATWebhook}`;

	const createPatConnection = async () => {
		const { pat, webhookSercet: secret } = getValues();

		setIsLoading(true);
		try {
			await HttpService.post(`/github/save?cid=${connectionId}&origin=web`, {
				pat,
				secret,
				webhook: webhookUrl,
			});
			const successMessage = t("connectionCreatedSuccessfully");
			addToast({
				id: Date.now().toString(),
				message: successMessage,
				type: "success",
			});
			LoggerService.info(namespaces.connectionService, successMessage);
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			const errorMessage = error.response?.data || tErrors("errorCreatingNewConnection");
			addToast({
				id: Date.now().toString(),
				message: errorMessage,
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: errorMessage })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			addToast({
				id: Date.now().toString(),
				message: t("github.copySuccess"),
				type: "success",
			});
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: t("github.copyFailure"),
				type: "error",
			});
		}
	};

	const handleGithubOAuth = async () => {
		try {
			window.open(`${baseUrl}/oauth/start/github?cid=${connectionId}&origin=web`, "_blank");
			navigate(`/projects/${projectId}/connections`);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("errorCreatingNewConnection"),
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorCreatingNewConnectionExtended", { error: (error as Error).message })}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = () => {
		if (connectionId) {
			createPatConnection();
		} else {
			triggerParentFormSubmit();
		}
	};

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
					className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-300"
					onClick={() => copyToClipboard(webhookUrl)}
					variant="outline"
				>
					<CopyIcon className="h-3.5 w-3.5 fill-black" />

					{t("buttons.copy")}
				</Button>
			</div>
			<div className="relative">
				<Input
					{...register("webhookSercet")}
					aria-label={t("github.placeholders.webhookSecret")}
					isError={!!errors.webhookSercet}
					isRequired
					placeholder={t("github.placeholders.webhookSecret")}
				/>

				<ErrorMessage>{errors.webhookSercet?.message as string}</ErrorMessage>
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
							className="group inline-flex items-center gap-2.5 text-green-accent"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-accent duration-200" />
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
					className="text-md inline-flex items-center gap-2.5 text-green-accent"
					target="_blank"
					to="https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
				>
					{t("github.aboutGitHubApps")}

					<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-accent duration-200" />
				</Link>
			</Accordion>

			<p className="mt-2">{t("github.clickButtonInstall")}</p>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
				onClick={() => triggerParentFormSubmit()}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	useEffect(() => {
		if (!selectedConnectionType) {
			return;
		}
		if (selectedConnectionType.value === GithubConnectionType.Pat) {
			createPatConnection();

			return;
		}
		if (selectedConnectionType.value === GithubConnectionType.Oauth) {
			handleGithubOAuth();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
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

				{selectedConnectionType && selectedConnectionType.value === GithubConnectionType.Pat
					? renderPATFields()
					: null}

				{selectedConnectionType && selectedConnectionType.value === GithubConnectionType.Oauth
					? renderOAuthButton()
					: null}
			</div>
		</form>
	);
};
