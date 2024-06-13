import React, { useState } from "react";
import { FloppyDiskIcon, ExternalLinkIcon } from "@assets/image/icons";
import { Select, Button, ErrorMessage, Input, Link, Spinner } from "@components/atoms";
import { baseUrl, namespaces } from "@constants";
import { selectIntegrationSlack, infoSlackModeLinks, infoSlackOAuthLinks } from "@constants/lists";
import { SlackConnectionType } from "@enums/connections";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoggerService, HttpService } from "@services";
import { useToastStore } from "@store";
import { isConnectionType } from "@utilities";
import { slackIntegrationSchema } from "@validations";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const SlackIntegrationForm = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const addToast = useToastStore((state) => state.addToast);

	const [selectedConnectionType, setSelectedConnectionType] = useState<SlackConnectionType>();
	const [isLoading, setIsLoading] = useState(false);

	const {
		handleSubmit,
		formState: { errors },
		register,
		getValues,
	} = useForm({
		resolver: zodResolver(slackIntegrationSchema),
		defaultValues: {
			botToken: "",
			appToken: "",
		},
	});

	const onSubmit = async () => {
		const { botToken, appToken } = getValues();

		setIsLoading(true);
		try {
			const { data } = await HttpService.post("/slack/save", { bot_token: botToken, app_token: appToken });
			if (!data.url) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("errorCreatingNewConnection"),
					title: "Error",
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("errorCreatingNewConnectionExtended", { error: tErrors("noDataReturnedFromServer") })}`
				);
				return;
			}
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("errorCreatingNewConnection"),
				title: "Error",
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

	const handleSLackOAuth = () => window.open(`${baseUrl}/oauth/start/slack`, "_blank");

	const renderSocketMode = () => (
		<>
			<div className="relative">
				<Input
					{...register("botToken")}
					aria-label={t("slack.placeholders.botToken")}
					isError={!!errors.botToken}
					isRequired
					placeholder={t("slack.placeholders.botToken")}
				/>
				<ErrorMessage>{errors.botToken?.message as string}</ErrorMessage>
			</div>
			<div className="relative">
				<Input
					{...register("appToken")}
					aria-label={t("slack.placeholders.appToken")}
					isError={!!errors.appToken}
					isRequired
					placeholder={t("slack.placeholders.appToken")}
				/>
				<ErrorMessage>{errors.appToken?.message as string}</ErrorMessage>
			</div>
			<Button
				aria-label={t("buttons.saveConnection")}
				className="px-3 ml-auto font-medium text-white border-white hover:bg-black w-fit"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="w-5 h-4 transition fill-white" />}{" "}
				{t("buttons.saveConnection")}
			</Button>
			<div>
				<p className="text-lg">{t("information")}:</p>
				<div className="flex flex-col items-start gap-2 mt-2">
					{infoSlackModeLinks.map(({ url, text }, idx) => (
						<Link
							className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
							key={idx}
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
			<div className="flex flex-col items-start gap-2 mt-2">
				{infoSlackOAuthLinks.map(({ url, text }, idx) => (
					<Link
						className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
						key={idx}
						target="_blank"
						to={url}
					>
						{text}
						<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
					</Link>
				))}
			</div>
			<p className="mt-1 ml-2">{t("slack.clickButtonInstall")}</p>
			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="px-3 ml-auto font-medium bg-white border-black hover:bg-gray-500 hover:text-white w-fit"
				onClick={handleSLackOAuth}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex flex-col w-full gap-6">
				<Select
					aria-label={t("placeholders.selectIntegration")}
					onChange={(selected) => {
						if (selected?.value && isConnectionType(selected.value, SlackConnectionType)) {
							setSelectedConnectionType(selected.value);
						}
					}}
					options={selectIntegrationSlack}
					placeholder={t("placeholders.selectIntegration")}
				/>
				{selectedConnectionType === SlackConnectionType.Mode ? renderSocketMode() : null}
				{selectedConnectionType === SlackConnectionType.Oauth ? renderOAuthButton() : null}
			</div>
		</form>
	);
};
