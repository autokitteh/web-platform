import React, { useState } from "react";
import { TestIcon, ExternalLinkIcon, CopyIcon } from "@assets/image/icons";
import { Select, Button, ErrorMessage, Input, Link, Spinner, Toast } from "@components/atoms";
import { baseUrl } from "@constants";
import { selectIntegrationGithub, infoGithubLinks } from "@constants/lists";
import { GithubConnectionType } from "@enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { githubIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const GithubIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const [selectedConnectionType, setSelectedConnectionType] = useState<GithubConnectionType | undefined>(undefined);
	const [toast, setToast] = useState({ isOpen: false, isSuccess: false, message: "" });

	const [isLoading, setIsLoading] = useState(false);

	const {
		handleSubmit,
		formState: { errors },
		register,
	} = useForm({
		resolver: zodResolver(githubIntegrationSchema),
		defaultValues: {
			pat: "",
			webhookSercet: "",
		},
	});
	//TODO: Implement onSubmit (request as it works in the current integration configuration HTTP://localhost:9980/i)
	const onSubmit = () => {
		setIsLoading(true);
		setTimeout(() => {
			setIsLoading(false);
		}, 3000);
	};

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setToast({ isOpen: true, isSuccess: true, message: t("github.copySuccess") });
		} catch (err) {
			setToast({ isOpen: true, isSuccess: false, message: t("github.copyFailure") });
		}
	};

	const isGithubConnectionType = (value: any): value is GithubConnectionType => {
		return Object.values(GithubConnectionType).includes(value);
	};

	const handleGithubOAuth = () => window.open(`${baseUrl}/oauth/start/github`, "_blank");

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
					value="https:///github/webhook/hLjam62q8Vq4DXsWmLFgsQ"
				/>
				<Button
					aria-label={t("buttons.copy")}
					className="px-5 font-semibold bg-white border-black rounded-md hover:bg-gray-300 w-fit"
					onClick={() => copyToClipboard("https:///github/webhook/hLjam62q8Vq4DXsWmLFgsQ")}
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

	const toastProps = {
		duration: 5,
		isOpen: toast.isOpen,
		onClose: () => setToast({ ...toast, isOpen: false }),
		title: toast.isSuccess ? t("success") : tErrors("error"),
	};

	return (
		<>
			<form className="flex items-start gap-10" id="createNewConnectionForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col w-full gap-6">
					<Select
						aria-label={t("placeholders.selectConnectionType")}
						onChange={(selected) => {
							if (selected?.value && isGithubConnectionType(selected.value)) {
								setSelectedConnectionType(selected.value);
							}
						}}
						options={selectIntegrationGithub}
						placeholder={t("placeholders.selectConnectionType")}
					/>
					{selectedConnectionType && selectedConnectionType === GithubConnectionType.PAT ? renderPATFields() : null}
					{selectedConnectionType && selectedConnectionType === GithubConnectionType.OAuth ? renderOAuthButton() : null}
				</div>
			</form>
			<Toast {...toastProps} ariaLabel={toast.message} type={toast.isSuccess ? "success" : "error"}>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};
