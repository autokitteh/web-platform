import React, { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { z } from "zod";

import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { extraTriggerTypes, featureFlags } from "@constants";
import { emptySelectItem } from "@constants/forms";
import { TriggerTypes } from "@enums";
import { TriggerFormIds } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { TriggersService } from "@services";
import { triggerSchema } from "@validations";

import { useFetchTrigger } from "@hooks";
import { useCacheStore, useHasActiveDeployments, useToastStore } from "@store";

import { Loader } from "@components/atoms";
import { ActiveDeploymentWarning, TabFormHeader } from "@components/molecules";
import {
	NameAndConnectionFields,
	SchedulerFields,
	SchedulerInfo,
	WebhookFields,
} from "@components/organisms/triggers/formParts";

type TriggerFormData = z.infer<typeof triggerSchema>;

export const EditTrigger = () => {
	const { projectId, triggerId } = useParams();
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
	const hasActiveDeployments = useHasActiveDeployments();

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		setWebhookUrlHighlight(navigationData?.highlightWebhookUrl || false);
	}, [navigationData]);

	const methods = useForm<TriggerFormData>({
		defaultValues: {
			name: "",
			connection: emptySelectItem,
			filePath: emptySelectItem,
			entryFunction: "",
			cron: "",
			eventTypeSelect: emptySelectItem,
			filter: "",
		},
		resolver: zodResolver(triggerSchema),
	});

	const { control, handleSubmit, reset } = methods;

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
			} catch (error) {
				addToast({
					message: error.message,
					type: "error",
				});
			}
		};

		loadFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const formattedConnections = useMemo(
		() => [
			...extraTriggerTypes,
			...(connections?.map((item) => ({
				label: item.name,
				value: item.connectionId,
			})) || []),
		],
		[connections]
	);

	useEffect(() => {
		let selectedConnection;
		if (trigger && formattedConnections?.length && !isLoadingTrigger && !isLoadingConnections) {
			selectedConnection = formattedConnections.find(
				(item) => item.value === trigger.sourceType || item.value === trigger.connectionId
			);
		}

		reset({
			name: trigger?.name,
			connection: selectedConnection || emptySelectItem,
			filePath: { label: trigger?.path, value: trigger?.path },
			entryFunction: trigger?.entryFunction,
			cron: trigger?.schedule,
			eventTypeSelect: { label: trigger?.eventType, value: trigger?.eventType },
			filter: trigger?.filter,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger, connections]);

	const onSubmit = async (data: TriggerFormData) => {
		setIsSaving(true);
		const { connection, cron, entryFunction, eventTypeSelect, filePath, filter, name } = data;
		try {
			const sourceType = connection.value in TriggerTypes ? connection.value : TriggerTypes.connection;
			const connectionId = connection.value in TriggerTypes ? undefined : connection.value;

			const processedFilter = featureFlags.sendDotEmptyTriggerFilter ? filter || "." : filter;

			const { error } = await TriggersService.update(projectId!, {
				sourceType,
				connectionId,
				name,
				path: filePath.value,
				entryFunction,
				schedule: cron,
				eventType: eventTypeSelect.value,
				filter: processedFilter,
				triggerId: triggerId!,
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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
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

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader
					className="mb-10"
					customBackRoute={`/projects/${projectId}/triggers`}
					form={TriggerFormIds.modifyTriggerForm}
					isLoading={isSaving}
					title={t("modifyTrigger")}
				/>
				{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}

				<form
					className="flex flex-col gap-6"
					id={TriggerFormIds.modifyTriggerForm}
					onSubmit={handleSubmit(onSubmit)}
				>
					<NameAndConnectionFields isEdit />

					{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerFields /> : null}

					<TriggerSpecificFields
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
			</div>
		</FormProvider>
	);
};
