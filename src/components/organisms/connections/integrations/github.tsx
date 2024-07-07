import React, { useMemo, useState } from "react";

import randomatic from "randomatic";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { CopyIcon, ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";
import { Button, ErrorMessage, Input, Link, Select, Spinner } from "@components/atoms";
import { baseUrl, namespaces } from "@constants";
import { githubIntegrationAuthMethods, infoGithubLinks } from "@constants/lists";
import { GithubConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { HttpService, LoggerService } from "@services";
import { useToastStore } from "@store";
import { isConnectionType } from "@utilities";
import { githubIntegrationSchema } from "@validations";

export const GithubIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<GithubConnectionType>();
	const { projectId } = useParams();

	const [isLoading, setIsLoading] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		defaultValues: {
			name: "",
			pat: "",
			webhookSercet: "",
		},
		resolver: zodResolver(githubIntegrationSchema),
	});

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const randomForPATWebhook = useMemo(() => randomatic("Aa0", 8), [projectId]);
	const webhookUrl = `${baseUrl}/${randomForPATWebhook}`;

	const onSubmit = async () => {
		const { name, pat, webhookSercet: secret } = getValues();

		setIsLoading(true);
		try {
			const { data } = await HttpService.post("/github/save", { name, pat, secret, webhook: webhookUrl });
			if (!data.url) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("errorCreatingNewConnection"),
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("errorCreatingNewConnectionExtended", { error: tErrors("noDataReturnedFromServer") })}`
				);

				return;
			}

			window.location.href = `${baseUrl}/${data.url}`;
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

	const handleGithubOAuth = () => window.open(`${baseUrl}/oauth/start/github`, "_blank");

	const renderPATFields = () => (
		<>
			<div className="relative">
				<Input
					{...register("name")}
					aria-label={t("github.placeholders.name")}
					isError={!!errors.name}
					isRequired
					placeholder={t("github.placeholders.name")}
				/>

				<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
			</div>
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
			<div className="flex gap-2 relative">
				<Input
					aria-label={t("github.placeholders.webhookUrl")}
					className="w-full"
					disabled
					placeholder={t("github.placeholders.webhookUrl")}
					value={webhookUrl}
				/>

				<Button
					aria-label={t("buttons.copy")}
					className="bg-white border-black font-semibold hover:bg-gray-300 px-5 rounded-md w-fit"
					onClick={() => copyToClipboard(webhookUrl)}
					variant="outline"
				>
					<CopyIcon className="fill-black h-3.5 w-3.5" />

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
				className="border-white font-medium hover:bg-black ml-auto px-3 text-white w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="fill-white h-5 transition w-5" />}

				{t("buttons.saveConnection")}
			</Button>
			<div>
				<p className="text-lg">{t("information")}:</p>

				<div className="flex flex-col gap-2 items-start mt-2">
					{infoGithubLinks.map(({ text, url }, index) => (
						<Link
							className="gap-2.5 group hover:text-green-accent inline-flex items-center ml-2"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="duration-200 fill-white group-hover:fill-green-accent h-3.5 w-3.5" />
						</Link>
					))}
				</div>
			</div>
		</>
	);

	const renderOAuthButton = () => (
		<div>
			<p className="text-lg">{t("information")}:</p>

			<Link
				className="gap-2.5 group hover:text-green-accent inline-flex items-center ml-2 mt-1 text-md"
				target="_blank"
				to="https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
			>
				{t("github.aboutGitHubApps")}

				<ExternalLinkIcon className="duration-200 fill-white group-hover:fill-green-accent h-3.5 w-3.5" />
			</Link>

			<p className="ml-2 mt-1">{t("github.clickButtonInstall")}</p>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="bg-white border-black font-medium hover:bg-gray-500 hover:text-white ml-auto px-3 w-fit"
				onClick={handleGithubOAuth}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	return (
		<form className="flex gap-10 items-start" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col gap-6 w-full">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={(selected) => {
						if (selected?.value && isConnectionType(selected.value, GithubConnectionType)) {
							setSelectedConnectionType(selected.value);
						}
					}}
					options={githubIntegrationAuthMethods}
					placeholder={t("placeholders.selectConnectionType")}
				/>

				{selectedConnectionType && selectedConnectionType === GithubConnectionType.Pat
					? renderPATFields()
					: null}

				{selectedConnectionType && selectedConnectionType === GithubConnectionType.Oauth
					? renderOAuthButton()
					: null}
			</div>
		</form>
	);
};
