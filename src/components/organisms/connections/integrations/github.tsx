import React, { useMemo, useState } from "react";
import { TestIcon, ExternalLinkIcon, CopyIcon } from "@assets/image/icons";
import { Select, Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { baseUrl, namespaces } from "@constants";
import { selectIntegrationGithub, infoGithubLinks } from "@constants/lists";
import { GithubConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoggerService } from "@services/logger.service";
import { useToastStore } from "@store/useToastStore";
import { isConnectionType } from "@utilities";
import { githubIntegrationSchema } from "@validations";
import axios from "axios";
import randomatic from "randomatic";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export const GithubIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<GithubConnectionType>();
	const { projectId } = useParams();

	const [isLoading, setIsLoading] = useState(false);

	const {
		handleSubmit,
		formState: { errors },
		register,
		getValues,
	} = useForm({
		resolver: zodResolver(githubIntegrationSchema),
		defaultValues: {
			pat: "",
			webhookSercet: "",
			name: "",
		},
	});

	const addToast = useToastStore((state) => state.addToast);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const randomForPATWebhook = useMemo(() => randomatic("Aa0", 8), [projectId]);
	const webhookUrl = `${baseUrl}/${randomForPATWebhook}`;

	const onSubmit = async () => {
		const { pat, webhookSercet: secret, name } = getValues();

		setIsLoading(true);
		try {
			const response = await axios.post(
				`${baseUrl}/github/save`,
				{ pat, secret, webhook: webhookUrl, name },
				{ headers: { "content-type": "application/x-www-form-urlencoded" } }
			);
			if (response.data.url) {
				// Handle the received URL, e.g., redirect to it or display it
				console.log("Received URL:", response.data.url);
				window.location.href = `${baseUrl}/${response.data.url}`;
			}
		} catch (error) {
			LoggerService.error(namespaces.connectionService, "Error while creating a new trigger");
		}
		setIsLoading(false);
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);

			addToast({
				id: Date.now().toString(),
				message: t("github.copySuccess"),
				title: "Success",
				type: "success",
			});
		} catch (err) {
			addToast({
				id: Date.now().toString(),
				message: t("github.copyFailure"),
				title: tErrors("error"),
				type: "error",
			});
		}
	};

	const handleGithubOAuth = () => window.open(`${baseUrl}/oauth/start/github`, "_blank");

	const renderPATFields = () => (
		<>
			<div className="relative">
				<Input {...register("name")} aria-label="name" isRequired placeholder="name" />
				<ErrorMessage>{errors.pat?.message as string}</ErrorMessage>
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
					className="px-5 font-semibold bg-white border-black rounded-md hover:bg-gray-300 w-fit"
					onClick={() => copyToClipboard(webhookUrl)}
					variant="outline"
				>
					<CopyIcon className="w-3.5 h-3.5 fill-black" />
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
				className="px-3 ml-auto font-medium text-white border-white hover:bg-black w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <TestIcon className="w-5 h-4 transition fill-white" />} {t("buttons.saveConnection")}
			</Button>
			<div>
				<p className="text-lg">{t("information")}:</p>
				<div className="flex flex-col items-start gap-2 mt-2">
					{infoGithubLinks.map(({ url, text, id }) => (
						<Link
							className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
							key={id}
							target="_blank"
							to={url}
						>
							{text}
							<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
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
				className="mt-1 inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent text-md"
				target="_blank"
				to="https://docs.github.com/en/apps/using-github-apps/about-using-github-apps"
			>
				{t("github.aboutGitHubApps")}
				<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
			</Link>
			<p className="mt-1 ml-2">{t("github.clickButtonInstall")}</p>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="px-3 ml-auto font-medium bg-white border-black hover:bg-gray-500 hover:text-white w-fit"
				onClick={handleGithubOAuth}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	return (
		<form className="flex items-start gap-10" id="createNewConnectionForm" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col w-full gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={(selected) => {
						if (selected?.value && isConnectionType(selected.value, GithubConnectionType)) {
							setSelectedConnectionType(selected.value);
						}
					}}
					options={selectIntegrationGithub}
					placeholder={t("placeholders.selectConnectionType")}
				/>
				{selectedConnectionType && selectedConnectionType === GithubConnectionType.Pat ? renderPATFields() : null}
				{selectedConnectionType && selectedConnectionType === GithubConnectionType.Oauth ? renderOAuthButton() : null}
			</div>
		</form>
	);
};
