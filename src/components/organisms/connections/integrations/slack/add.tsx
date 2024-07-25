import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { baseUrl, namespaces } from "@constants";
import { infoSlackModeLinks, infoSlackOAuthLinks, selectIntegrationSlack } from "@constants/lists/connections";
import { SlackConnectionType } from "@enums";
import { SelectOption } from "@interfaces/components";
import { HttpService, LoggerService } from "@services";
import { slackIntegrationSchema } from "@validations";

import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Select, Spinner } from "@components/atoms";
import { Accordion } from "@components/molecules";

import { ExternalLinkIcon, FloppyDiskIcon } from "@assets/image/icons";

export const SlackIntegrationAddForm = ({
	connectionId,
	triggerParentFormSubmit,
}: {
	connectionId?: string;
	triggerParentFormSubmit: () => void;
}) => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("integrations");
	const { projectId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);
	const [selectedConnectionType, setSelectedConnectionType] = useState<SelectOption>();
	const [isLoading, setIsLoading] = useState(false);

	const {
		formState: { errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		resolver: zodResolver(slackIntegrationSchema),
		defaultValues: {
			botToken: "",
			appToken: "",
		},
	});

	const createConnection = async () => {
		setIsLoading(true);
		const { appToken, botToken } = getValues();

		try {
			await HttpService.post(`/slack/save?cid=${connectionId}&origin=web`, {
				bot_token: botToken,
				app_token: appToken,
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

	const handleSlackOAuth = async () => {
		try {
			window.open(`${baseUrl}/oauth/start/slack?cid=${connectionId}&origin=web`, "_blank");
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
		}
	};

	const onSubmit = () => {
		connectionId ? createConnection() : triggerParentFormSubmit();
	};

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
				className="ml-auto w-fit border-white px-3 font-medium text-white hover:bg-black"
				disabled={isLoading}
				type="submit"
				variant="outline"
			>
				{isLoading ? <Spinner /> : <FloppyDiskIcon className="h-4 w-5 fill-white transition" />}

				{t("buttons.saveConnection")}
			</Button>
			<Accordion title={t("information")}>
				<div className="flex flex-col gap-2">
					{infoSlackModeLinks.map(({ text, url }, index) => (
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
				<div className="flex flex-col gap-2">
					{infoSlackOAuthLinks.map(({ text, url }, index) => (
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

			<p className="ml-2 mt-1">{t("slack.clickButtonInstall")}</p>

			<Button
				aria-label={t("buttons.startOAuthFlow")}
				className="ml-auto w-fit border-black bg-white px-3 font-medium hover:bg-gray-500 hover:text-white"
				onClick={handleSlackOAuth}
				variant="outline"
			>
				{t("buttons.startOAuthFlow")}
			</Button>
		</div>
	);

	const renderConnectionFields = () => {
		switch (selectedConnectionType?.value) {
			case SlackConnectionType.Mode:
				return renderSocketMode();
			case SlackConnectionType.Oauth:
				return renderOAuthButton();
			default:
				return null;
		}
	};

	useEffect(() => {
		renderConnectionFields();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	const selectConnectionType = (option: SingleValue<SelectOption>) => {
		setSelectedConnectionType(option as SelectOption);
	};

	return (
		<form className="flex items-start gap-10" onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full flex-col gap-6">
				<Select
					aria-label={t("placeholders.selectConnectionType")}
					onChange={selectConnectionType}
					options={selectIntegrationSlack}
					placeholder={t("placeholders.selectConnectionType")}
					value={selectedConnectionType}
				/>

				{renderConnectionFields()}
			</div>
		</form>
	);
};
