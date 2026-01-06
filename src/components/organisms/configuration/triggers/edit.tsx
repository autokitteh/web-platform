import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { NameAndConnectionFields, SchedulerFields, SchedulerInfo, WebhookFields } from "./formParts";
import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { TriggersService } from "@services";
import { defaultTimezoneValue, basicTriggerTypes, featureFlags } from "@src/constants";
import { emptySelectItem } from "@src/constants/forms";
import { DeploymentStateVariant, TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { SelectOption, EditTriggerProps } from "@src/interfaces/components";
import { TriggerForm } from "@src/types/models";
import { extractSettingsPath } from "@src/utilities/navigation";
import { triggerSchema } from "@validations";

import { useFetchTrigger } from "@hooks";
import {
	useBuildFilesStore,
	useCacheStore,
	useHasActiveDeployments,
	useOrgConnectionsStore,
	useToastStore,
} from "@store";

import { Loader, Toggle } from "@components/atoms";
import { ActiveDeploymentWarning, DurableDescription, SyncDescription, TabFormHeader } from "@components/molecules";

export const EditTrigger = ({
	triggerId: triggerIdProp,
	onSuccess: onSuccessProp,
	onBack: onBackProp,
}: EditTriggerProps = {}) => {
	const { projectId, id: triggerIdParam } = useParams();
	const navigate = useNavigate();
	const triggerId = triggerIdProp || triggerIdParam;
	const onBack = onBackProp || (() => navigate(".."));
	const onSuccess = onSuccessProp || (() => onBack());

	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const location = useLocation();
	const navigationData = location.state;
	const [webhookUrlHighlight, setWebhookUrlHighlight] = useState(false);
	const { isLoading: isLoadingTrigger, trigger } = useFetchTrigger(triggerId!);
	const {
		connections,
		fetchResources,
		fetchTriggers,
		loading: { connections: isLoadingConnections },
	} = useCacheStore();
	const orgConnections = useOrgConnectionsStore((state) => state.orgConnections);
	const hasActiveDeployments = useHasActiveDeployments();
	const { fetchBuildFiles } = useBuildFilesStore();

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [buildFiles, setBuildFiles] = useState<Record<string, string[]>>({});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setWebhookUrlHighlight(navigationData?.highlightWebhookUrl || false);
	}, [navigationData]);

	const methods = useForm<TriggerForm>({
		defaultValues: {
			name: "",
			connection: emptySelectItem,
			filePath: emptySelectItem,
			entryFunction: undefined,
			cron: "",
			eventTypeSelect: emptySelectItem,
			filter: "",
			timezone: defaultTimezoneValue,
			isDurable: false,
			isSync: false,
		},
		resolver: zodResolver(triggerSchema),
	});

	const { control, handleSubmit, reset, watch, setValue } = methods;

	const { deployments } = useCacheStore();

	useEffect(() => {
		const loadFiles = async () => {
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
			} catch (error) {
				addToast({
					message: error.message,
					type: "error",
				});
			}
		};

		loadFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [deployments]);

	const formattedConnections = useMemo(
		() => [
			...basicTriggerTypes,
			...(connections?.map((item) => ({
				label: item.name,
				value: item.connectionId,
			})) || []),
			...(orgConnections?.map((item) => ({
				label: item.name,
				value: item.connectionId,
			})) || []),
		],
		[connections, orgConnections]
	);

	useEffect(() => {
		let selectedConnection;
		if (trigger && formattedConnections?.length && !isLoadingTrigger && !isLoadingConnections) {
			selectedConnection = formattedConnections.find(
				(item) => item.value === trigger.sourceType || item.value === trigger.connectionId
			);
		}

		const eventTypeSelectItem = trigger?.eventType
			? { eventTypeSelect: { label: trigger.eventType, value: trigger.eventType } }
			: {};

		reset({
			name: trigger?.name,
			connection: selectedConnection || emptySelectItem,
			filePath: { label: trigger?.path, value: trigger?.path },
			entryFunction: trigger?.entryFunction
				? { label: trigger.entryFunction, value: trigger.entryFunction }
				: undefined,
			cron: trigger?.schedule,
			timezone: trigger?.timezone || defaultTimezoneValue,
			...eventTypeSelectItem,
			filter: trigger?.filter,
			isDurable: trigger?.isDurable || false,
			isSync: trigger?.isSync || false,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger, formattedConnections]);

	const isOptionalTriggerType = (connectionValue: string) =>
		connectionValue === TriggerTypes.webhook || connectionValue === TriggerTypes.connection;

	const validateFileAndFunction = (data: TriggerForm) => {
		if (isOptionalTriggerType(data.connection.value)) return true;

		if (data.filePath?.label) {
			return data.entryFunction?.value && data.entryFunction.value.length > 0;
		}
		return true;
	};

	const onSubmit = async (data: TriggerForm) => {
		setIsSaving(true);
		const {
			connection,
			cron,
			entryFunction,
			eventTypeSelect,
			filePath,
			filter,
			name,
			timezone,
			isDurable,
			isSync,
		} = data;

		if (!validateFileAndFunction(data)) {
			addToast({
				message: t("validations.functionRequired"),
				type: "error",
			});
			setIsSaving(false);
			return;
		}

		try {
			const sourceType = Object.values(TriggerTypes).includes(connection.value as TriggerTypes)
				? (connection.value as TriggerTypes)
				: TriggerTypes.connection;
			const connectionId = Object.values(TriggerTypes).includes(connection.value as TriggerTypes)
				? undefined
				: connection.value;

			const processedFilter = featureFlags.sendDotEmptyTriggerFilter ? filter || "." : filter;

			const { error } = await TriggersService.update(projectId!, {
				sourceType,
				connectionId,
				name,
				path: filePath?.value,
				entryFunction: entryFunction?.value,
				schedule: cron,
				timezone,
				eventType: eventTypeSelect?.value || "",
				filter: processedFilter,
				triggerId: triggerId!,
				isDurable,
				isSync,
			});
			if (error) {
				addToast({
					message: tErrors("triggerNotEdited"),
					type: "error",
				});

				return;
			}
			await fetchTriggers(projectId!, true);
			addToast({
				message: t("updatedSuccessfully"),
				type: "success",
			});

			if (onSuccess) {
				onSuccess();
			}
		} catch {
			addToast({
				message: tErrors("triggerNotUpdated"),
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const watchedEventTypeSelect = useWatch({ control, name: "eventTypeSelect" });

	if (isLoadingConnections || isLoadingTrigger) {
		return <Loader isCenter size="xl" />;
	}

	const { basePath } = extractSettingsPath(location.pathname);

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader
					customBackRoute={`${basePath}/settings/triggers`}
					form={TriggerFormIds.modifyTriggerForm}
					hideXbutton={false}
					isCancelButtonHidden
					isLoading={isSaving}
					onBack={onBack}
					title={t("modifyTrigger")}
				/>
				{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

				<form
					className="my-4 flex flex-col gap-6"
					id={TriggerFormIds.modifyTriggerForm}
					onSubmit={handleSubmit(onSubmit)}
				>
					<NameAndConnectionFields isEdit />

					{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerFields /> : null}

					<TriggerSpecificFields
						buildFiles={buildFiles}
						connectionId={trigger?.connectionId || ""}
						filesNameList={filesNameList}
						selectedEventType={watchedEventTypeSelect}
					/>

					{trigger?.sourceType === TriggerTypes.webhook ? (
						<WebhookFields
							connectionId={trigger?.connectionId || ""}
							highlight={webhookUrlHighlight}
							webhookSlug={trigger.webhookSlug || ""}
						/>
					) : null}
				</form>

				{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerInfo /> : null}
				<div className="ml-1 flex flex-col gap-4">
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
