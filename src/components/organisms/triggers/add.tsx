import React, { useEffect, useState } from "react";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { SelectOption } from "@interfaces/components";
import { LoggerService, TriggersService } from "@services";
import { namespaces } from "@src/constants";
import { emptySelectItem } from "@src/constants/forms";
import { TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { cn } from "@src/utilities";
import { TriggerFormData, triggerResolver } from "@validations";

import { useCacheStore, useHasActiveDeployments, useToastStore } from "@store";

import { Loader, Toggle } from "@components/atoms";
import { ActiveDeploymentWarning, TabFormHeader } from "@components/molecules";
import {
	NameAndConnectionFields,
	SchedulerFields,
	SchedulerInfo,
	WebhookFields,
} from "@components/organisms/triggers/formParts";

export const DurableDescription = () => (
	<div>
		Durability means every step of a workflow is saved,
		<br />
		so it can recover and resume exactly where it left off—even
		<br />
		after crashes, failures, or redeployments.
	</div>
);

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const navigate = useNavigate();
	const { projectId } = useParams();
	const [isSaving, setIsSaving] = useState(false);
	const addToast = useToastStore((state) => state.addToast);
	const {
		fetchResources,
		fetchTriggers,
		loading: { connections: isLoadingConnections },
	} = useCacheStore();

	const hasActiveDeployments = useHasActiveDeployments();

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);

	const methods = useForm<TriggerFormData>({
		defaultValues: {
			name: "",
			connection: emptySelectItem,
			filePath: emptySelectItem,
			entryFunction: "",
			cron: "",
			eventTypeSelect: emptySelectItem,
			filter: "",
			isDurable: false,
		},
		resolver: triggerResolver,
	});

	const { control, handleSubmit, watch, setValue } = methods;

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
			} finally {
				setIsLoadingFiles(false);
			}
		};

		loadFiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onSubmit = async (data: TriggerFormData) => {
		setIsSaving(true);
		try {
			const sourceType = Object.values(TriggerTypes).includes(data.connection.value as TriggerTypes)
				? (data.connection.value as TriggerTypes)
				: TriggerTypes.connection;
			const connectionId = Object.values(TriggerTypes).includes(data.connection.value as TriggerTypes)
				? undefined
				: data.connection.value;

			const { cron, entryFunction, eventTypeSelect, filePath, filter, name, isDurable } = data;

			const { data: triggerId, error } = await TriggersService.create(projectId!, {
				sourceType,
				connectionId,
				name,
				path: filePath?.value,
				entryFunction,
				schedule: cron,
				eventType: eventTypeSelect?.value || "",
				filter,
				triggerId: undefined,
				isDurable,
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
			navigate(`/projects/${projectId}/triggers/${triggerId}/edit`, {
				state: { highlightWebhookUrl: true },
			});
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

	const rowClass = cn("flex w-full flex-row justify-between", {
		"justify-end": !hasActiveDeployments,
	});

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader
					className="mb-6"
					form={TriggerFormIds.addTriggerForm}
					isLoading={isSaving}
					title={t("addNewTrigger")}
				/>

				<form
					className="flex flex-col gap-6"
					id={TriggerFormIds.addTriggerForm}
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className={rowClass}>{hasActiveDeployments ? <ActiveDeploymentWarning /> : null}</div>
					<NameAndConnectionFields />
					{connectionType === TriggerTypes.schedule ? <SchedulerFields /> : null}
					<TriggerSpecificFields connectionId={connectionType} filesNameList={filesNameList} />
					{connectionType === TriggerTypes.webhook ? <WebhookFields connectionId={connectionType} /> : null}
				</form>

				{connectionType === TriggerTypes.schedule ? <SchedulerInfo /> : null}
				<Toggle
					checked={watch("isDurable") || false}
					className="mt-4"
					description={<DurableDescription />}
					label="Durable"
					onChange={(checked) => setValue("isDurable", checked)}
				/>
			</div>
		</FormProvider>
	);
};
