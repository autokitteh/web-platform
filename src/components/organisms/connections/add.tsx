import React, { useEffect, useRef, useState } from "react";

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
import { connectionSchema } from "@validations/index";

import { ErrorMessage, Input, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { GoogleIntegrationForm } from "@components/organisms/connections/integrations";
import { GithubIntegrationAddForm } from "@components/organisms/connections/integrations/github";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");

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

	const connectionName: string = watch("connectionName");
	const selectedIntegration: SelectOption = watch("integration");
	const { t: tErrors } = useTranslation("errors");

	const [connectionId, setConnectionId] = useState<string | undefined>(undefined);
	const { projectId } = useParams();
	const addToast = useToastStore((state) => state.addToast);

	const childFormSubmitRef = useRef<(() => void) | null>(null);

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

	useEffect(() => {
		if (connectionId && childFormSubmitRef.current) {
			childFormSubmitRef.current();
		}
	}, [connectionId]);

	const handleIntegrationChange = (option: SingleValue<SelectOption>): void => {
		setValue("integration", option as SelectOption);
	};

	const integrationComponents: Record<IntegrationType, JSX.Element> = {
		github: (
			<GithubIntegrationAddForm connectionId={connectionId} triggerParentFormSubmit={handleSubmit(onSubmit)} />
		),
		google: <GoogleIntegrationForm />,
	};

	const selectedIntegrationComponent = selectedIntegration
		? integrationComponents[selectedIntegration.value as IntegrationType]
		: null;

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" title={t("addNewConnection")} />

			<form className="mb-6 flex w-5/6 flex-col" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						aria-label={t("github.placeholders.name")}
						{...register("connectionName", { required: "Connection name is required" })}
						disabled={!!connectionId}
						isError={!!errors.connectionName}
						placeholder={t("github.placeholders.name")}
					/>

					<ErrorMessage>{errors?.connectionName?.message}</ErrorMessage>
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
