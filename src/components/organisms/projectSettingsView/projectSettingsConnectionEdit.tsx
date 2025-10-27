import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { integrationTypes } from "@constants/lists";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { integrationToEditComponent } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { useHasActiveDeployments } from "@src/store";
import { cn, stripGoogleConnectionName } from "@src/utilities";
import { connectionSchema } from "@validations";

import { Button, IconSvg, Input, Loader } from "@components/atoms";
import { ActiveDeploymentWarning, Select } from "@components/molecules";

import { ArrowLeft } from "@assets/image/icons";

interface ProjectSettingsConnectionEditProps {
	connectionId: string;
	onBack: () => void;
}

export const ProjectSettingsConnectionEdit = ({ connectionId, onBack }: ProjectSettingsConnectionEditProps) => {
	const { t } = useTranslation("integrations");
	const {
		connectionName,
		errors,
		fetchConnection,
		integration: selectedIntegration,
		register,
	} = useConnectionForm(connectionSchema, "edit");

	const hasActiveDeployments = useHasActiveDeployments();

	useEffect(() => {
		if (connectionId) {
			fetchConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	let integrationType = selectedIntegration?.value;
	let googleIntegrationApplication;

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (connectionName) {
			setLoading(false);
		}
	}, [connectionName]);

	if (integrationType && selectedIntegration?.value) {
		googleIntegrationApplication = stripGoogleConnectionName(integrationType);

		if (googleIntegrationApplication) {
			integrationType = googleIntegrationApplication;
			selectedIntegration!.value = googleIntegrationApplication;
		}
	}

	const SelectedIntegrationComponent = selectedIntegration
		? integrationToEditComponent[integrationType as keyof typeof Integrations]
		: null;

	const connectionInfoClass = cn("visible w-full", { invisible: loading });
	const loaderClass = cn("invisible", { visible: loading });

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
					<h2 className="text-2xl font-semibold text-white">{t("editConnection")}</h2>
				</div>
			</div>

			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

			<div className={connectionInfoClass}>
				<div className="flex flex-col">
					<div className="relative mb-6">
						<Input
							aria-label={t("github.placeholders.name")}
							{...register("connectionName")}
							disabled
							isError={!!errors.connectionName}
							isRequired
							label={t("github.placeholders.name")}
							value={connectionName}
						/>
					</div>
				</div>

				{selectedIntegration ? (
					<div>
						<Select
							aria-label={t("placeholders.selectIntegration")}
							disabled
							label={t("placeholders.integration")}
							options={integrationTypes}
							placeholder={t("placeholders.selectIntegration")}
							value={selectedIntegration}
						/>

						<div className="mt-6">
							{SelectedIntegrationComponent ? (
								<SelectedIntegrationComponent
									googleIntegrationApplication={googleIntegrationApplication}
								/>
							) : null}
						</div>
					</div>
				) : (
					<div className="pl-1 text-error">
						{t("integrationNotFound")}

						<div className="mt-2">{t("integrationNotFoundMessage")}</div>
					</div>
				)}
			</div>
			<Loader className={loaderClass} isCenter />
		</div>
	);
};
