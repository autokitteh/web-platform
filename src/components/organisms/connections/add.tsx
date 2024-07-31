import React from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { IntegrationType } from "@type/components";
import { connectionSchema } from "@validations";

import { useConnectionForm } from "@hooks";

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

	const { connectionId, errors, handleSubmit, onSubmit, register, setValue, watch } = useConnectionForm(
		{ connectionName: "", integration: { label: "", value: "" } },
		connectionSchema,
		"create"
	);

	const selectedIntegration: SelectOption = watch("integration");

	const handleIntegrationChange = (option: SingleValue<SelectOption>) => {
		setValue("integration", option);
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

					<ErrorMessage>{errors?.connectionName?.message as string}</ErrorMessage>
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
