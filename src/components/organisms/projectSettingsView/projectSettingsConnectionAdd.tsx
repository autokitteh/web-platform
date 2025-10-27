import React from "react";

import { useTranslation } from "react-i18next";

import { integrationTypes } from "@constants/lists";
import { SelectOption } from "@interfaces/components";
import { integrationAddFormComponents } from "@src/constants/connections";
import { Integrations } from "@src/enums/components";
import { useHasActiveDeployments } from "@src/store";
import { stripGoogleConnectionName } from "@src/utilities";
import { connectionSchema } from "@validations";

import { useConnectionForm } from "@hooks";

import { Button, ErrorMessage, IconSvg, Input } from "@components/atoms";
import { ActiveDeploymentWarning, Select } from "@components/molecules";

import { ArrowLeft } from "@assets/image/icons";

interface ProjectSettingsConnectionAddProps {
	onBack: () => void;
}

export const ProjectSettingsConnectionAdd = ({ onBack }: ProjectSettingsConnectionAddProps) => {
	const { t } = useTranslation("integrations");
	const { connectionId, errors, handleSubmit, onSubmit, register, setValue, watch, isLoading } = useConnectionForm(
		connectionSchema,
		"create"
	);
	const hasActiveDeployments = useHasActiveDeployments();

	const selectedIntegration: SelectOption = watch("integration");

	const integrationType = stripGoogleConnectionName(selectedIntegration?.value) || selectedIntegration?.value;

	if (integrationType) {
		selectedIntegration!.value = integrationType;
	}
	const SelectedIntegrationComponent = selectedIntegration
		? integrationAddFormComponents[integrationType as keyof typeof Integrations]
		: null;

	return (
		<div className="mx-auto flex size-full flex-col gap-2 overflow-y-auto p-6">
			<div className="mb-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Button
						ariaLabel="Back to Settings"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						onClick={onBack}
					>
						<IconSvg className="fill-white" src={ArrowLeft} />
					</Button>
					<h2 className="text-2xl font-semibold text-white">{t("addNewConnection")}</h2>
				</div>
			</div>

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
					dataTestid="select-integration"
					disabled={!!connectionId || isLoading}
					label={t("placeholders.integration")}
					onChange={(selectedIntegration) => setValue("integration", selectedIntegration)}
					options={integrationTypes}
					placeholder={t("placeholders.selectIntegration")}
					value={selectedIntegration}
				/>
			</form>

			<div className="w-5/6">
				{SelectedIntegrationComponent ? (
					<SelectedIntegrationComponent
						connectionId={connectionId}
						triggerParentFormSubmit={handleSubmit(onSubmit)}
						type={selectedIntegration?.value}
					/>
				) : null}
			</div>
		</div>
	);
};
