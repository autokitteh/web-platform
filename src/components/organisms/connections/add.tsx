import React, { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { namespaces } from "@constants";
import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService } from "@services";
import { IntegrationType } from "@type/components";
import { connectionSchema } from "@validations";

import { useToastStore } from "@store";

import { ErrorMessage, Input } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";
import {
	AwsIntegrationAddForm,
	DiscordIntegrationAddForm,
	GithubIntegrationAddForm,
	GoogleIntegrationAddForm,
	HttpIntegrationAddForm,
	JiraIntegrationAddForm,
	OpenAiIntegrationAddForm,
	SlackIntegrationAddForm,
	TwilioIntegrationAddForm,
} from "@components/organisms/connections/integrations";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");
	const { t: tErrors } = useTranslation("errors");

	const [connectionId, setConnectionId] = useState<string | undefined>(undefined);
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { errors },
		handleSubmit,
		register,
		setValue,
		watch,
	} = useForm({
		resolver: zodResolver(connectionSchema),
		mode: "onChange",
		defaultValues: {
			connectionName: "",
			integration: {
				label: "",
				value: "",
			},
		},
	});

	const connectionName = watch("connectionName");
	const selectedIntegration: SelectOption = watch("integration");

	const onSubmit = async () => {
		if (!connectionId) {
			try {
				const { data, error } = await ConnectionService.create(
					projectId!,
					selectedIntegration.value,
					connectionName!
				);

				if (error) {
					addToast({
						id: Date.now().toString(),
						message: (error as Error).message,
						type: "error",
					});

					return;
				}

				setConnectionId(data);
			} catch (error) {
				const errorMessage = error?.response?.data || tErrors("errorCreatingNewConnection");

				addToast({
					id: Date.now().toString(),
					message: errorMessage,
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("errorCreatingNewConnectionExtended", { error: errorMessage })}`
				);
			}
		}
	};

	const handleIntegrationChange = (option: SingleValue<SelectOption>): void => {
		setValue("integration", option as SelectOption);
	};

	const integrationComponents: Record<IntegrationType, JSX.Element> = {
		github: (
			<GithubIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
		slack: <SlackIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />,
		gmail: (
			<GoogleIntegrationAddForm
				connectionId={connectionId}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
				type={selectedIntegration.value}
			/>
		),
		google: (
			<GoogleIntegrationAddForm
				connectionId={connectionId}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
				type={selectedIntegration.value}
			/>
		),
		googlesheets: (
			<GoogleIntegrationAddForm
				connectionId={connectionId}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
				type={selectedIntegration.value}
			/>
		),
		googlecalendar: (
			<GoogleIntegrationAddForm
				connectionId={connectionId}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
				type={selectedIntegration.value}
			/>
		),
		googledrive: (
			<GoogleIntegrationAddForm
				connectionId={connectionId}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
				type={selectedIntegration.value}
			/>
		),
		googleforms: (
			<GoogleIntegrationAddForm
				connectionId={connectionId}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
				type={selectedIntegration.value}
			/>
		),
		aws: <AwsIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />,
		chatgpt: (
			<OpenAiIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
		http: <HttpIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />,
		twilio: (
			<TwilioIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
		jira: <JiraIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />,
		discord: (
			<DiscordIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
	};

	const selectedIntegrationComponent = selectedIntegration
		? integrationComponents[selectedIntegration.value as IntegrationType]
		: null;

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" isHiddenButtons title={t("addNewConnection")} />

			<form className="mb-6 flex w-5/6 flex-col" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						aria-label={t("github.placeholders.name")}
						{...register("connectionName")}
						disabled={!!connectionId}
						isError={!!errors.connectionName}
						isRequired
						placeholder={t("github.placeholders.name")}
					/>

					<ErrorMessage>{errors?.connectionName?.message}</ErrorMessage>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					dataTestid="select-connection-type"
					disabled={!!connectionId}
					label={t("placeholders.integration")}
					onChange={handleIntegrationChange}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
			</form>

			<div className="w-5/6">{selectedIntegrationComponent}</div>
		</div>
	);
};
