import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { TriggersService } from "@services";
import { TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { triggerSchema } from "@validations";

import { useFetchConnections, useFetchTrigger, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Loader } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import {
	NameAndConnectionFields,
	SchedulerFields,
	SchedulerInfo,
	WebhookFields,
} from "@components/organisms/triggers/formParts";

type TriggerFormData = z.infer<typeof triggerSchema>;

export const EditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);

	const { connections, isLoading: isLoadingConnections } = useFetchConnections(projectId!);
	const { isLoading: isLoadingTrigger, trigger } = useFetchTrigger(triggerId!);
	const { fetchResources } = useFileOperations(projectId!);

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

	useEffect(() => {
		const loadFiles = async () => {
			try {
				const resources = await fetchResources();
				const formattedResources = Object.keys(resources).map((name) => ({
					label: name,
					value: name,
				}));
				setFilesNameList(formattedResources);
			} catch (error) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("resourcesFetchError"),
					type: "error",
				});
			}
		};

		loadFiles();
	}, [fetchResources, addToast, tErrors]);
	const [isSaving, setIsSaving] = useState(false);

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
		if (trigger && connections.length) {
			const selectedConnection = connections.find(
				(item) => item.value === trigger.connectionId || item.value === trigger.sourceType
			);
			reset({
				name: trigger.name,
				connection: selectedConnection,
				filePath: { label: trigger.path, value: trigger.path },
				entryFunction: trigger.entryFunction,
				cron: trigger.schedule,
				eventType: trigger.eventType,
				filter: trigger.filter,
			});
		}
	}, [trigger, connections, reset]);

	const onSubmit = async (data: TriggerFormData) => {
		setIsSaving(true);
		try {
			const { error } = await TriggersService.update(projectId!, {
				sourceType: data.connection.value as TriggerTypes,
				name: data.name,
				path: data.filePath.value,
				entryFunction: data.entryFunction,
				schedule: data.cron,
				eventType: data.eventType,
				filter: data.filter,
				triggerId: triggerId!,
			});

			if (error) {
				addToast({
					id: Date.now()?.toString(),
					message: tErrors("triggerNotEdited"),
					type: "error",
				});
			}

			addToast({
				id: Date.now().toString(),
				message: t("updatedSuccessfully"),
				type: "success",
			});
			navigate(`/projects/${projectId}/triggers`);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("triggerNotUpdated"),
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoadingConnections || isLoadingTrigger) {
		return <Loader isCenter size="xl" />;
	}

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader
					className="mb-10"
					form={TriggerFormIds.modifyTriggerForm}
					isLoading={isSaving}
					title={t("modifyTrigger")}
				/>

				<form
					className="flex flex-col gap-6"
					id={TriggerFormIds.modifyTriggerForm}
					onSubmit={handleSubmit(onSubmit)}
				>
					<NameAndConnectionFields connections={connections} isEdit />

					{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerFields /> : null}

					{trigger?.sourceType === TriggerTypes.webhook ? (
						<WebhookFields webhookSlug={trigger.webhookSlug || ""} />
					) : null}

					<TriggerSpecificFields filesNameList={filesNameList} />
				</form>

				{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerInfo /> : null}
			</div>
		</FormProvider>
	);
};
