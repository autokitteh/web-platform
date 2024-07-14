import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { IntegrationType } from "@type/components";
import { connectionSchema } from "@validations/index";

import { ErrorMessage, Input, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { GithubIntegrationForm, GoogleIntegrationForm } from "@components/organisms/connections/integrations";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");

	const {
		formState: { errors, isValid },
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

	const onSubmit = () => {};

	const handleIntegrationChange = (option: SingleValue<SelectOption>): void => {
		setValue("integration", option as SelectOption);
	};

	const integrationComponents: Record<IntegrationType, JSX.Element> = {
		github: (
			<GithubIntegrationForm
				connectionName={connectionName}
				isConnectionNameValid={connectionName ? isValid : false}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
			/>
		),
		google: (
			<GoogleIntegrationForm
				connectionName={connectionName}
				isConnectionNameValid={connectionName ? isValid : false}
				triggerParentFormSubmit={handleSubmit(onSubmit)}
			/>
		),
	};

	const selectedIntegrationComponent: JSX.Element | null = selectedIntegration
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
