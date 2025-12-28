import React, { useEffect, useState } from "react";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { NameAndConnectionFields, SchedulerFields, SchedulerInfo, WebhookFields } from "./formParts";
import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { AddTriggerProps, SelectOption } from "@interfaces/components";
import { LoggerService, TriggersService } from "@services";
import { defaultTimezoneValue, namespaces } from "@src/constants";
import { emptySelectItem } from "@src/constants/forms";
import { DeploymentStateVariant, TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { TriggerForm } from "@src/types/models";
import { extractSettingsPath } from "@src/utilities/navigation";
import { triggerResolver } from "@validations";

import { useBuildFilesStore, useCacheStore, useHasActiveDeployments, useToastStore } from "@store";

import { Loader, Toggle } from "@components/atoms";
import { ActiveDeploymentWarning, DurableDescription, SyncDescription, TabFormHeader } from "@components/molecules";

export const AddTrigger = ({ onBack: onBackProp }: AddTriggerProps = {}) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const navigate = useNavigate();
	const location = useLocation();
	const { basePath } = extractSettingsPath(location.pathname);
	const { projectId } = useParams();
	const handleBack = onBackProp || (() => navigate(".."));
	const handleSuccess = () => handleBack();
	const [isSaving, setIsSaving] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const {
		fetchResources,
		fetchTriggers,
		loading: { connections: isLoadingConnections },
	} = useCacheStore();

	const hasActiveDeployments = useHasActiveDeployments();
	const { fetchBuildFiles } = useBuildFilesStore();

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [buildFiles, setBuildFiles] = useState<Record<string, string[]>>({});
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);

	const methods = useForm<TriggerForm>({
		defaultValues: {
			name: "",
			connection: emptySelectItem,
			filePath: emptySelectItem,
			entryFunction: undefined,
			cron: "",
			eventTypeSelect: emptySelectItem,
			filter: "",
			isDurable: false,
			isSync: false,
			timezone: defaultTimezoneValue,
		},
		resolver: triggerResolver,
	});

	const { control, handleSubmit, watch, setValue } = methods;

	const { deployments } = useCacheStore();

	useEffect(() => {
		const loadFiles = async () => {
			setIsLoadingFiles(true);
			try {
				const resources = await fetchResources(projectId!);
				if (!resources) return;
				const formattedResources = Object.keys(resources).map((name) => ({
					label: name,
					value: name,
				}));
				setFilesNameList(formattedResources);

				const activeDeployment = deployments?.find(
					(deployment) => deployment.state === DeploymentStateVariant.active
				);
				if (activeDeployment?.buildId) {
					const { data: files } = await fetchBuildFiles(projectId!, activeDeployment.buildId);
					if (files) {
						setBuildFiles(files);
					}
				}
			} finally {
				setIsLoadingFiles(false);
			}
		};

		loadFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments]);

	const onSubmit = async (data: TriggerForm) => {
		setIsSaving(true);
		try {
			const sourceType = Object.values(TriggerTypes).includes(data.connection.value as TriggerTypes)
				? (data.connection.value as TriggerTypes)
				: TriggerTypes.connection;
			const connectionId = Object.values(TriggerTypes).includes(data.connection.value as TriggerTypes)
				? undefined
				: data.connection.value;

			const { cron, entryFunction, eventTypeSelect, filePath, filter, name, timezone, isDurable, isSync } = data;

			const { data: triggerId, error } = await TriggersService.create(projectId!, {
				sourceType,
				connectionId,
				name,
				path: filePath?.value,
				entryFunction: entryFunction?.value,
				schedule: cron,
				timezone,
				eventType: eventTypeSelect?.value || "",
				filter,
				triggerId: undefined,
				isDurable,
				isSync,
			});

			if (error) {
				addToast({
					message: tErrors("triggerNotCreated"),
					type: "error",
				});

				return;
			}

			addToast({
				message: t("createdSuccessfully"),
				type: "success",
			});

			await fetchTriggers(projectId!, true);

			if (triggerId) {
				handleSuccess();
				navigate(`${basePath}/settings/triggers/${triggerId}/edit`, {
					state: { highlightWebhookUrl: true },
				});
			}
		} catch (error) {
			addToast({
				message: tErrors("triggerNotCreated"),
				type: "error",
			});

			LoggerService.error(
				namespaces.triggerService,
				t("triggerNotCreatedExtended", { error: (error as Error).message, projectId })
			);
		} finally {
			setIsSaving(false);
		}
	};

	const connectionType = useWatch({ control, name: "connection.value" });
	if (isLoadingConnections || isLoadingFiles) {
		return <Loader isCenter size="xl" />;
	}

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader
					form={TriggerFormIds.addTriggerForm}
					hideBackButton
					hideXbutton={false}
					isCancelButtonHidden
					isLoading={isSaving}
					onBack={handleBack}
					title={t("addNewTrigger")}
				/>
				{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}
				<form
					className="flex flex-col gap-6"
					id={TriggerFormIds.addTriggerForm}
					onSubmit={handleSubmit(onSubmit)}
				>
					<NameAndConnectionFields />
					{connectionType === TriggerTypes.schedule ? <SchedulerFields /> : null}
					<TriggerSpecificFields
						buildFiles={buildFiles}
						connectionId={connectionType}
						filesNameList={filesNameList}
					/>
					{connectionType === TriggerTypes.webhook ? <WebhookFields connectionId={connectionType} /> : null}
				</form>

				{connectionType === TriggerTypes.schedule ? <SchedulerInfo /> : null}
				<div className="ml-1 mt-4 flex flex-col gap-4">
					<Toggle
						checked={watch("isDurable") || false}
						description={<DurableDescription />}
						label="Durability - for long-running reliable workflows"
						onChange={(checked) => setValue("isDurable", checked)}
					/>
					<Toggle
						checked={watch("isSync") || false}
						description={<SyncDescription />}
						label="Synchronous Response"
						onChange={(checked) => setValue("isSync", checked)}
					/>
				</div>
			</div>
		</FormProvider>
	);
};
