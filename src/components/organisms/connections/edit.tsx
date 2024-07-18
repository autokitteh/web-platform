import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SingleValue } from "react-select";

import { integrationTypes } from "@constants/lists";
import { namespaces } from "@constants/namespaces.logger.constants";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService } from "@services/index";
import { useToastStore } from "@store/index";
import { IntegrationType } from "@type/components";
import { Connection } from "@type/models";
import { connectionSchema } from "@validations/index";

import { ErrorMessage, Input, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { GithubIntegrationForm, GoogleIntegrationForm } from "@components/organisms/connections/integrations";

export const EditConnection = () => {
	const { t } = useTranslation("integrations");
	const { connectionId } = useParams();
	const [connection, setConnection] = useState<Connection | undefined>();
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);

	const {
		formState: { errors, isValid },
		handleSubmit,
		register,
		setValue,
	} = useForm({
		resolver: zodResolver(connectionSchema),
		mode: "onChange",
	});

	const fetchConnection = async (connectionId: string) => {
		try {
			const { data: connectionResponse, error } = await ConnectionService.get(connectionId);

			if (error) {
				const errorMessage = tErrors("errorFetchingConnection");

				addToast({
					id: Date.now().toString(),
					message: errorMessage,
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("errorFetchingConnectionExtended", { error: (error as Error).message })}`
				);

				return;
			}
			if (!connectionResponse) {
				const errorMessage = tErrors("connectionNotFound");

				addToast({
					id: Date.now().toString(),
					message: errorMessage,
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					`${tErrors("connectionNotFoundExtended", { connectionId })}`
				);

				return;
			}

			setConnection(connectionResponse);
			setValue("connectionName", connectionResponse.name);
			setValue("integration", {
				label: connectionResponse.integrationName,
				value: connectionResponse.integrationUniqueName,
			});
		} catch (error) {
			const errorMessage = tErrors("errorFetchingConnection");

			addToast({
				id: Date.now().toString(),
				message: errorMessage,
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorFetchingConnectionExtended", { error: error?.response?.data })}`
			);
		}
	};

	useEffect(() => {
		fetchConnection(connectionId!);
	}, [connectionId]);

	const onSubmit = async (data: any) => {
		try {
			await ConnectionService.update(connectionId!, data);
			addToast({
				id: Date.now().toString(),
				message: t("connectionUpdatedSuccessfully"),
				type: "success",
			});
		} catch (error) {
			const errorMessage = error?.response?.data || tErrors("errorUpdatingConnection");

			addToast({
				id: Date.now().toString(),
				message: errorMessage,
				type: "error",
			});
			LoggerService.error(
				namespaces.connectionService,
				`${tErrors("errorUpdatingConnectionExtended", { error: errorMessage })}`
			);
		}
	};

	const handleIntegrationChange = (option: SingleValue<SelectOption>): void => {
		setValue("integration", option as SelectOption);
	};

	const integrationComponents: Record<IntegrationType, JSX.Element> = {
		github: (
			<GithubIntegrationForm connection={connection} editMode triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
		google: (
			<GoogleIntegrationForm
				connectionName={connection?.name}
				isConnectionNameValid={connection?.name ? isValid : false}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
			/>
		),
	};

	const selectedIntegration = {
		label: connection?.integrationName,
		value: connection?.integrationUniqueName,
	} as SelectOption;

	const selectedIntegrationComponent: JSX.Element =
		integrationComponents[connection?.integrationUniqueName as IntegrationType];

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("editConnection")} />

			<form className="mb-6 flex w-5/6 flex-col" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						aria-label={t("github.placeholders.name")}
						{...register("connectionName", { required: "Connection name is required" })}
						disabled={!!connectionId}
						isError={!!errors.connectionName}
						placeholder={t("github.placeholders.name")}
					/>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
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
