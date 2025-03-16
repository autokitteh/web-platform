import React from "react";

import { useTranslation } from "react-i18next";

import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { formsPerIntegrationsMapping, getAuthTypesForIntegration } from "@src/constants/connections";
import { ConnectionAuthType } from "@src/enums";
import { useHasActiveDeployments } from "@src/store";
import { stripGoogleConnectionName } from "@src/utilities";

import { useConnectionForm } from "@hooks";

import { ErrorMessage, Input } from "@components/atoms";
import { ActiveDeploymentWarning, Select, TabFormHeader } from "@components/molecules";

export const AddConnection = () => {
	const { t } = useTranslation("integrations");
	const {
		errors,
		handleSubmit,
		onSubmit,
		register,
		setValue,
		watch,
		control,
		isLoading,
		clearErrors,
		addConnectionType,
		setAddConnectionType,
	} = useConnectionForm("create");

	const hasActiveDeployments = useHasActiveDeployments();

	const selectedIntegration: SelectOption = watch("integration");

	const integrationType = stripGoogleConnectionName(selectedIntegration?.value) || selectedIntegration?.value;

	if (integrationType) {
		selectedIntegration!.value = integrationType;
	}

	const ConnectionTypeComponent =
		formsPerIntegrationsMapping[selectedIntegration?.value as keyof typeof formsPerIntegrationsMapping]?.[
			addConnectionType?.value as ConnectionAuthType
		];

	const integrationAuthMethods = getAuthTypesForIntegration(selectedIntegration?.value);

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" isHiddenButtons title={t("addNewConnection")} />
			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<form className="mb-6 flex w-5/6 flex-col" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative mb-6">
					<Input
						aria-label={t("placeholders.name")}
						{...register("connectionName")}
						disabled={!!connectionId || isLoading}
						isError={!!errors.connectionName}
						isRequired
						label={t("placeholders.name")}
					/>

					<ErrorMessage>{errors?.connectionName?.message as string}</ErrorMessage>
				</div>

				<Select
					aria-label={t("placeholders.selectIntegration")}
					className="mb-6"
					dataTestid="select-integration"
					disabled={!!connectionId || isLoading}
					label={t("placeholders.integration")}
					onChange={(selectedIntegration) => setValue("integration", selectedIntegration)}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
				{selectedIntegration ? (
					<>
						<Select
							aria-label={t("placeholders.selectConnectionType")}
							className="mb-6"
							disabled={isLoading}
							label={t("placeholders.connectionType")}
							onChange={(option) => setAddConnectionType(option)}
							options={integrationAuthMethods}
							placeholder={t("placeholders.selectConnectionType")}
							value={addConnectionType}
						/>
						<div className="flex flex-col gap-6">
							{ConnectionTypeComponent ? (
								<ConnectionTypeComponent
									clearErrors={clearErrors}
									control={control}
									errors={errors}
									isLoading={isLoading}
									mode="create"
									register={register}
									setValue={setValue}
								/>
							) : null}
						</div>
					</>
				) : null}
			</form>
		</div>
	);
};
