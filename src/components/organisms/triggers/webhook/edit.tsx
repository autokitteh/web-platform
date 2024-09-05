import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { TriggersService } from "@services";
import { infoCronExpressionsLinks } from "@src/constants";
import { TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { getApiBaseUrl } from "@src/utilities";
import { webhookTriggerSchema } from "@validations";

import { useFetchConnections, useFetchTrigger, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Button, ErrorMessage, Input, Link, Loader } from "@components/atoms";
import { Accordion, Select, TabFormHeader } from "@components/molecules";

import { CopyIcon, ExternalLinkIcon } from "@assets/image/icons";

export const WebhookEditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t: tGlobal } = useTranslation(["global"]);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useFileOperations(projectId!);
	const { connections, isLoading: isLoadingConnections } = useFetchConnections(projectId!);
	const { isLoading: isLoadingTrigger, trigger } = useFetchTrigger(triggerId!);
	const [isSaving, setIsSaving] = useState(false);

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

	useEffect(() => {
		const fetchResourcesData = async () => {
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
		fetchResourcesData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		control,
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
	} = useForm({
		defaultValues: {
			connection: { label: "", value: "" },
			entryFunction: "",
			filePath: { label: "", value: "" },
			name: "",
		},
		resolver: zodResolver(webhookTriggerSchema),
	});

	useEffect(() => {
		if (trigger && !!connections.length) {
			const selectedConnection = connections.find(
				(item) => item.value === trigger.connectionId || item.value === trigger.sourceType
			);
			reset({
				entryFunction: trigger.entryFunction,
				filePath: { label: trigger.path, value: trigger.path },
				name: trigger.name,
				connection: selectedConnection,
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger, connections]);

	const onSubmit = async () => {
		const { entryFunction, filePath, name } = getValues();
		setIsSaving(true);
		const { error } = await TriggersService.update(projectId!, {
			sourceType: TriggerTypes.webhook,
			entryFunction,
			eventType: "",
			name,
			path: filePath.value,
			triggerId: triggerId!,
		});
		setIsSaving(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("triggerNotFound"),
				type: "error",
			});

			return;
		}

		navigate(`/projects/${projectId!}/triggers`);
	};

	const entryFunction = useWatch({ control, name: "entryFunction" });
	const name = useWatch({ control, name: "name" });
	const apiBaseUrl = getApiBaseUrl();

	return isLoadingConnections || isLoadingTrigger ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form={TriggerFormIds.modifySchedulerForm}
				isLoading={isSaving}
				title={t("modifyTrigger")}
			/>

			<form
				className="flex w-full flex-col gap-6"
				id={TriggerFormIds.modifySchedulerForm}
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="relative">
					<Input
						{...register("name")}
						aria-label={t("placeholders.name")}
						disabled
						isError={!!errors.name}
						isRequired
						label={t("placeholders.name")}
						value={name}
					/>

					<ErrorMessage>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Controller
						control={control}
						name="connection"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectConnection")}
								dataTestid="select-trigger-type"
								disabled
								isError={!!errors.connection}
								label={t("placeholders.connection")}
								noOptionsLabel={t("noConnectionsAvailable")}
								onChange={(selected) => field.onChange(selected)}
								options={connections}
								placeholder={t("placeholders.selectConnection")}
								value={field.value}
							/>
						)}
					/>

					<ErrorMessage>{errors.connection?.message}</ErrorMessage>
				</div>

				<div className="relative flex gap-2">
					<Input
						aria-label={t("placeholders.webhookUrl")}
						className="w-full"
						disabled
						label={t("placeholders.webhookUrl")}
						placeholder="The webhook URL will be generated after saving the trigger."
						value={`${apiBaseUrl}/${trigger?.webhookSlug}`}
					/>

					<Button
						aria-label={tGlobal("copy")}
						className="w-fit rounded-md border-black bg-white px-5 font-semibold hover:bg-gray-950"
						disabled
						variant="outline"
					>
						<CopyIcon className="h-3.5 w-3.5 fill-black" />

						{tGlobal("copy")}
					</Button>
				</div>

				<div className="relative">
					<Controller
						control={control}
						name="filePath"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectFile")}
								dataTestid="select-file"
								isError={!!errors.filePath}
								label={t("placeholders.file")}
								noOptionsLabel={t("noFilesAvailable")}
								onChange={(selected) => field.onChange(selected)}
								options={filesNameList}
								placeholder={t("placeholders.selectFile")}
								value={field.value}
							/>
						)}
					/>

					<ErrorMessage>{errors.filePath?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						value={entryFunction}
						{...register("entryFunction")}
						aria-label={t("placeholders.functionName")}
						isError={!!errors.entryFunction}
						isRequired
						label={t("placeholders.functionName")}
					/>

					<ErrorMessage>{errors.entryFunction?.message}</ErrorMessage>
				</div>
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
	);
};
