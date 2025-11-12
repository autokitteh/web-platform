import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { integrationTypes } from "@constants/lists";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { EditConnectionProps } from "@interfaces/components";
import { integrationToEditComponent } from "@src/constants";
import { Integrations } from "@src/enums/components";
import { useHasActiveDeployments } from "@src/store";
import { cn, stripGoogleConnectionName } from "@src/utilities";
import { connectionSchema } from "@validations";

import { Input, Loader } from "@components/atoms";
import { ActiveDeploymentWarning, Select, TabFormHeader } from "@components/molecules";

export const EditConnection = ({ connectionId: connectionIdProp, onBack: onBackProp }: EditConnectionProps = {}) => {
	const { t } = useTranslation("integrations");
	const navigate = useNavigate();
	const { id: connectionIdParam } = useParams();
	const connectionId = connectionIdProp || connectionIdParam;
	const onBack = onBackProp || (() => navigate(".."));
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

	const connectionInfoClass = cn("visible mb-6 w-full", { invisible: loading });
	const loaderClass = cn("invisible", { visible: loading });

	if (!connectionId) {
		return null;
	}
	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-6" isSaveButtonHidden onBack={onBack} title={t("editConnection")} />
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
