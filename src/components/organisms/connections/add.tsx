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

import { ErrorMessage, Input, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import {
	GithubIntegrationAddForm,
	GmailIntegrationAddForm,
	GoogleIntegrationAddForm,
} from "@components/organisms/connections/integrations";
import { SlackIntegrationAddForm } from "@components/organisms/connections/integrations/slack";

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
				const { data } = await ConnectionService.create(projectId!, selectedIntegration.value, connectionName!);
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
		google: (
			<GoogleIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
		gmail: <GmailIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />,
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
					disabled={!!connectionId}
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
