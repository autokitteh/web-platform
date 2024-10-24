import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { z } from "zod";

import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { TriggersService } from "@services";
import { DeploymentStateVariant, TriggerTypes } from "@src/enums";
import { ModalName, TriggerFormIds } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { triggerSchema } from "@validations";

import { useFetchConnections, useFetchTrigger, useFileOperations } from "@hooks";
import { useCacheStore, useModalStore, useToastStore } from "@store";

import { Loader } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { WarningDeploymentActivetedModal } from "@components/organisms";
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
	const { connections, isLoading: isLoadingConnections } = useFetchConnections(projectId!);
	const { isLoading: isLoadingTrigger, trigger } = useFetchTrigger(triggerId!);
	const { fetchResources } = useFileOperations(projectId!);
	const { deployments, fetchTriggers } = useCacheStore();
	const { closeModal, openModal } = useModalStore();

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [formData, setFormData] = useState<TriggerFormData>();

	useEffect(() => {
		setWebhookUrlHighlight(navigationData?.highlightWebhookUrl || false);
	}, [navigationData]);

	const methods = useForm<TriggerFormData>({
		defaultValues: {
			name: "",
			connection: { label: "", value: "" },
			filePath: { label: "", value: "" },
			entryFunction: "",
			cron: "",
			eventType: "",
			filter: "",
		},
		resolver: zodResolver(triggerSchema),
	});

	const { handleSubmit, reset } = methods;

	useEffect(() => {
		const loadFiles = async () => {
			try {
				const resources = await fetchResources();
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

	useEffect(() => {
		let selectedConnection;
		if (trigger && connections.length && !isLoadingTrigger && !isLoadingConnections) {
			selectedConnection = connections.find(
				(item) => item.value === trigger.connectionId || item.value === trigger.sourceType
			);
		}

		reset({
			name: trigger?.name,
			connection: selectedConnection || { label: "", value: "" },
			filePath: { label: trigger?.path, value: trigger?.path },
			entryFunction: trigger?.entryFunction,
			cron: trigger?.schedule,
			eventType: trigger?.eventType,
			filter: trigger?.filter,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger, connections]);

	const onSubmit = async () => {
		closeModal(ModalName.warningDeploymentActive);
		if (!formData) return;
		setIsSaving(true);

		try {
			const sourceType =
				formData?.connection.value in TriggerTypes ? formData.connection.value : TriggerTypes.connection;
			const connectionId = formData.connection.value in TriggerTypes ? undefined : formData.connection.value;

			const { error } = await TriggersService.update(projectId!, {
				sourceType,
				connectionId,
				name: formData.name,
				path: formData.filePath.value,
				entryFunction: formData.entryFunction,
				schedule: formData.cron,
				eventType: formData.eventType,
				filter: formData.filter,
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

	const handleFormSubmit = (data: TriggerFormData) => {
		setFormData(data);
		if (deployments?.length && deployments[0].state === DeploymentStateVariant.active) {
			openModal(ModalName.warningDeploymentActive);

			return;
		}
		onSubmit();
	};

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

				<form
					className="flex flex-col gap-6"
					id={TriggerFormIds.modifyTriggerForm}
					onSubmit={handleSubmit(handleFormSubmit)}
				>
					<NameAndConnectionFields connections={connections} isEdit />

					{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerFields /> : null}

					<TriggerSpecificFields filesNameList={filesNameList} />

					{trigger?.sourceType === TriggerTypes.webhook ? (
						<WebhookFields highlight={webhookUrlHighlight} webhookSlug={trigger.webhookSlug || ""} />
					) : null}
				</form>

				{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerInfo /> : null}

				<WarningDeploymentActivetedModal onClick={onSubmit} />
			</div>
		</FormProvider>
	);
};
