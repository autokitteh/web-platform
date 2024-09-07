import React, { useEffect, useState } from "react";

import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { TriggerSpecificFields } from "./formParts/fileAndFunction";
import { SelectOption } from "@interfaces/components";
import { TriggersService } from "@services";
import { TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { TriggerFormData, triggerResolver } from "@validations";

import { useFetchConnections, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Loader } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import {
	NameAndConnectionFields,
	SchedulerFields,
	SchedulerInfo,
	WebhookFields,
} from "@components/organisms/triggers/formParts";

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const navigate = useNavigate();
	const { projectId } = useParams<{ projectId: string }>();
	const [isSaving, setIsSaving] = useState(false);
	const addToast = useToastStore((state) => state.addToast);

	const { isLoading: isLoadingConnections } = useFetchConnections(projectId!);
	const { fetchResources } = useFileOperations(projectId!);
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [isLoadingFiles, setIsLoadingFiles] = useState(false);
	const { connections } = useFetchConnections(projectId!);

	const methods = useForm<TriggerFormData>({
		defaultValues: {
			name: "",
			connection: { label: "", value: "" },
			filePath: { label: "", value: "" },
			entryFunction: "",
			cron: "",
		},
		resolver: triggerResolver,
	});

	const { handleSubmit } = methods;

	useEffect(() => {
		const loadFiles = async () => {
			setIsLoadingFiles(true);
			try {
				const resources = await fetchResources();
				const formattedResources = Object.keys(resources).map((name) => ({
					label: name,
					value: name,
				}));
				setFilesNameList(formattedResources);
			} catch (error) {
				addToast({
					id: Date.now()?.toString(),
					message: tErrors("resourcesFetchError"),
					type: "error",
				});
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
			const { error } = await TriggersService.create(projectId!, {
				sourceType: data.connection.value as TriggerTypes,
				name: data.name,
				path: data.filePath.value,
				entryFunction: data.entryFunction,
				schedule: data.cron,
				eventType: "",
				triggerId: undefined,
			});

			if (error) {
				addToast({
					id: Date.now()?.toString(),
					message: tErrors("triggerNotCreated"),
					type: "error",
				});

				return;
			}

			addToast({
				id: Date.now()?.toString(),
				message: t("createdSuccessfully"),
				type: "success",
			});
			navigate(`/projects/${projectId}/triggers`);
		} catch (error) {
			addToast({
				id: Date.now()?.toString(),
				message: tErrors("triggerNotCreated"),
				type: "error",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const connectionType = useWatch({ control: methods.control, name: "connection.value" });

	if (isLoadingConnections || isLoadingFiles) {
		return <Loader isCenter size="xl" />;
	}

	return (
		<FormProvider {...methods}>
			<div className="min-w-80">
				<TabFormHeader
					className="mb-10"
					form={TriggerFormIds.addTriggerForm}
					isLoading={isSaving}
					title={t("addNewTrigger")}
				/>

				<form className="flex flex-col gap-6" id="triggerForm" onSubmit={handleSubmit(onSubmit)}>
					<NameAndConnectionFields connections={connections} />

					{connectionType === TriggerTypes.webhook ? <WebhookFields /> : null}

					{connectionType === TriggerTypes.schedule ? <SchedulerFields /> : null}

					<TriggerSpecificFields filesNameList={filesNameList} />
				</form>

				{connectionType === TriggerTypes.schedule ? <SchedulerInfo /> : null}
			</div>
		</FormProvider>
	);
};
