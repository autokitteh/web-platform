import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { TriggersService } from "@services";
import { TriggerTypes } from "@src/enums";
import { TriggerFormIds } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { defaultTriggerSchema } from "@validations";

import { useFetchConnections, useFetchTrigger, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { ErrorMessage, Input, Loader } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";

export const DefaultEditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useFileOperations(projectId!);
	const { connections, isLoading: isLoadingConnections } = useFetchConnections(projectId!);
	const { isLoading: isLoadingTrigger, trigger } = useFetchTrigger(triggerId!);

	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [isSaving, setIsSaving] = useState(false);

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
			eventType: "",
			filePath: { label: "", value: "" },
			filter: "",
			name: "",
		},
		resolver: zodResolver(defaultTriggerSchema),
	});

	useEffect(() => {
		if (trigger && !!connections.length) {
			const selectedConnection = connections.find((item) => item.value === trigger.connectionId);

			reset({
				connection: selectedConnection,
				entryFunction: trigger.entryFunction,
				eventType: trigger.eventType,
				filePath: { label: trigger.path, value: trigger.path },
				filter: trigger.filter,
				name: trigger.name,
			});
		}
	}, [trigger, connections, reset]);

	const onSubmit = async () => {
		const { connection, entryFunction, eventType, filePath, filter, name } = getValues();

		setIsSaving(true);
		const { error } = await TriggersService.update(projectId!, {
			sourceType: TriggerTypes.connection,
			connectionId: connection.value,
			entryFunction,
			eventType,
			filter,
			name,
			path: filePath.value,
			triggerId: trigger?.triggerId,
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

		navigate(-1);
	};

	const entryFunction = useWatch({ control, name: "entryFunction" });
	const eventType = useWatch({ control, name: "eventType" });
	const filter = useWatch({ control, name: "filter" });
	const name = useWatch({ control, name: "name" });

	return isLoadingConnections || isLoadingTrigger ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form={TriggerFormIds.modifyDefaultForm}
				isLoading={isSaving}
				title={t("modifyTrigger")}
			/>

			<form
				className="flex w-full flex-col gap-6"
				id={TriggerFormIds.modifyDefaultForm}
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="relative">
					<Input
						disabled
						{...register("name")}
						aria-label={t("placeholders.name")}
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

				<div className="relative">
					<Controller
						control={control}
						name="filePath"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectFile")}
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
						{...register("entryFunction")}
						aria-label={t("placeholders.functionName")}
						isError={!!errors.entryFunction}
						isRequired
						label={t("placeholders.functionName")}
						value={entryFunction}
					/>

					<ErrorMessage>{errors.entryFunction?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("eventType")}
						aria-label={t("placeholders.eventType")}
						isError={!!errors.eventType}
						label={t("placeholders.eventType")}
						value={eventType}
					/>

					<ErrorMessage>{errors.eventType?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("filter")}
						aria-label={t("placeholders.filter")}
						isError={!!errors.filter}
						label={t("placeholders.filter")}
						value={filter}
					/>

					<ErrorMessage>{errors.filter?.message}</ErrorMessage>
				</div>
			</form>
		</div>
	);
};
