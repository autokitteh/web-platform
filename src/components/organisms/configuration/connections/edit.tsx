import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { integrationTypes } from "@constants/lists";
import { useConnectionForm } from "@hooks/useConnectionForm";
import { EditConnectionProps } from "@interfaces/components";
import { integrationToEditComponent } from "@src/constants/connections/editComponentsMapping.constants";
import { Integrations } from "@src/enums/components";
import { useConnectionStore, useHasActiveDeployments } from "@src/store";
import { cn, stripGoogleConnectionName } from "@src/utilities";
import { connectionSchema } from "@validations";

import { Input, Loader } from "@components/atoms";
import {
	ActiveDeploymentWarning,
	OrgConnectionModificationWarning,
	Select,
	TabFormHeader,
} from "@components/molecules";

export const EditConnection = (
	{
		connectionId: connectionIdProp,
		onBack: onBackProp,
		onXcloseGoBack,
		isDrawerMode,
		onSuccess,
		isOrgConnection,
	}: EditConnectionProps = {
		isDrawerMode: false,
		isOrgConnection: false,
	}
) => {
	const { t } = useTranslation("integrations");
	const navigate = useNavigate();
	const { id: connectionIdParam } = useParams();
	const connectionId = connectionIdProp || connectionIdParam;
	const onBack = onBackProp || (() => navigate(".."));
	const setEditingConnectionId = useConnectionStore((state) => state.setEditingConnectionId);
	const {
		connectionName,
		errors,
		fetchConnection,
		integration: selectedIntegration,
	} = useConnectionForm(connectionSchema, "edit", undefined, onSuccess, isOrgConnection);

	const [editedConnectionName, setEditedConnectionName] = useState<string>("");

	const hasActiveDeployments = useHasActiveDeployments();

	useEffect(() => {
		if (connectionId) {
			setEditingConnectionId(connectionId);
			fetchConnection(connectionId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId]);

	useEffect(() => {
		return () => {
			setEditingConnectionId(undefined);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		return () => {
			setEditingConnectionId(undefined);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	let integrationType = selectedIntegration?.value;
	let googleIntegrationApplication;

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (connectionName) {
			setLoading(false);
			setEditedConnectionName(connectionName);
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

	const close = () => (onXcloseGoBack ? navigate("..") : onBack());
	const dataTestid = "select-integration";

	return (
		<div className="min-w-80">
			<TabFormHeader
				hideBackButton
				hideTitle={isDrawerMode}
				hideXbutton={isDrawerMode}
				isHiddenButtons
				isSaveButtonHidden
				onBack={close}
				title={t("editConnection")}
			/>
			{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}
			{isOrgConnection ? <OrgConnectionModificationWarning /> : null}
			<div className={connectionInfoClass}>
				<div className="flex flex-col">
					<div className="relative mb-6">
						<Input
							aria-label={t("placeholders.name")}
							isError={!!errors.connectionName}
							isRequired
							label={t("placeholders.name")}
							onChange={(e) => setEditedConnectionName(e.target.value)}
							value={editedConnectionName}
						/>
					</div>
				</div>

				{selectedIntegration ? (
					<div>
						<Select
							aria-label={t("placeholders.selectIntegration")}
							dataTestid={dataTestid}
							disabled
							label={t("placeholders.integration")}
							options={integrationTypes}
							placeholder={t("placeholders.selectIntegration")}
							value={selectedIntegration}
						/>

						<div className="mt-6">
							{SelectedIntegrationComponent ? (
								<SelectedIntegrationComponent
									editedConnectionName={editedConnectionName}
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
