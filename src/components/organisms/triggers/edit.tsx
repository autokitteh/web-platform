import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { TriggersService } from "@services";
import { infoCronExpressionsLinks } from "@src/constants";
import { TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { getApiBaseUrl } from "@src/utilities";
import { triggerSchema } from "@validations";

import { useFetchConnections, useFetchTrigger, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Loader } from "@components/atoms";
import { Accordion, Select, TabFormHeader } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon } from "@assets/image/icons";

type TriggerFormData = z.infer<typeof triggerSchema>;

const CommonFields = ({ connections }: { connections: SelectOption[] }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
	} = useFormContext<TriggerFormData>();

	return (
		<>
			<div className="relative">
				<Input
					aria-label={t("placeholders.name")}
					control={control}
					disabled
					isError={!!errors.name}
					label={t("placeholders.name")}
					name="name"
				/>

				<ErrorMessage>{errors.name?.message?.toString() || ""}</ErrorMessage>
			</div>

			<div className="relative">
				<Select
					aria-label={t("placeholders.selectConnection")}
					control={control}
					dataTestid="select-trigger-type"
					disabled
					isError={!!errors.connection}
					label={t("placeholders.connection")}
					name="connection"
					noOptionsLabel={t("noConnectionsAvailable")}
					options={connections}
					placeholder={t("placeholders.selectConnection")}
				/>

				<ErrorMessage>{errors.connection?.message?.toString() || ""}</ErrorMessage>
			</div>
		</>
	);
};

const SchedulerFields = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
	} = useFormContext<TriggerFormData>();

	return (
		<div className="relative">
			<Input
				aria-label={t("placeholders.cron")}
				control={control}
				isError={!!errors.cron}
				label={t("placeholders.cron")}
				name="cron"
			/>

			<ErrorMessage>{errors.cron?.message?.toString() || ""}</ErrorMessage>
		</div>
	);
};

const WebhookFields = ({ webhookSlug }: { webhookSlug: string }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tGlobal } = useTranslation("global");
	const apiBaseUrl = getApiBaseUrl();
	const webhookUrl = `${apiBaseUrl}/${webhookSlug}`;

	return (
		<div className="relative flex gap-2">
			<Input
				aria-label={t("placeholders.webhookUrl")}
				className="w-full"
				disabled
				label={t("placeholders.webhookUrl")}
				name="webhookUrl"
				value={webhookUrl}
			/>

			<Button
				aria-label={tGlobal("copy")}
				className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
				onClick={() => navigator.clipboard.writeText(webhookUrl)}
				variant="outline"
			>
				<CopyIcon className="h-3.5 w-3.5 fill-black" />

				{tGlobal("copy")}
			</Button>
		</div>
	);
};

const TriggerSpecificFields = ({ filesNameList }: { filesNameList: SelectOption[] }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
	} = useFormContext<TriggerFormData>();
	const connectionType = useWatch({ name: "connection.value" });

	return (
		<>
			<div className="relative">
				<Select
					aria-label={t("placeholders.selectFile")}
					control={control}
					dataTestid="select-file"
					isError={!!errors.filePath}
					label={t("placeholders.file")}
					name="filePath"
					noOptionsLabel={t("noFilesAvailable")}
					options={filesNameList}
					placeholder={t("placeholders.selectFile")}
				/>

				<ErrorMessage>{errors.filePath?.message?.toString() || ""}</ErrorMessage>
			</div>

			<div className="relative">
				<Input
					aria-label={t("placeholders.functionName")}
					control={control}
					isError={!!errors.entryFunction}
					label={t("placeholders.functionName")}
					name="entryFunction"
				/>

				<ErrorMessage>{errors.entryFunction?.message?.toString() || ""}</ErrorMessage>
			</div>

			{connectionType === TriggerTypes.connection ? (
				<>
					<div className="relative">
						<Input
							aria-label={t("placeholders.eventType")}
							control={control}
							isError={!!errors.eventType}
							label={t("placeholders.eventType")}
							name="eventType"
						/>

						<ErrorMessage>{errors.eventType?.message?.toString() || ""}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							aria-label={t("placeholders.filter")}
							control={control}
							isError={!!errors.filter}
							label={t("placeholders.filter")}
							name="filter"
						/>

						<ErrorMessage>{errors.filter?.message?.toString() || ""}</ErrorMessage>
					</div>
				</>
			) : null}
		</>
	);
};

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
					<CommonFields connections={connections} />

					{trigger?.sourceType === TriggerTypes.schedule ? <SchedulerFields /> : null}

					{trigger?.sourceType === TriggerTypes.webhook ? (
						<WebhookFields webhookSlug={trigger.webhookSlug || ""} />
					) : null}

					<TriggerSpecificFields filesNameList={filesNameList} />
				</form>

				<Accordion className="mt-4" title={t("information")}>
					<div className="flex flex-col items-start gap-2">
						{infoCronExpressionsLinks.map(({ text, url }, index) => (
							<Link
								className="inline-flex items-center gap-2.5 text-green-800"
								key={index}
								target="_blank"
								to={url}
							>
								{text}

								<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
							</Link>
						))}
					</div>
				</Accordion>
			</div>
		</FormProvider>
	);
};
