import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { debounce, has } from "lodash";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { TriggersService } from "@services";
import { schedulerTriggerConnectionName } from "@src/constants";
import { TriggerFormIds } from "@src/enums/components";
import { SelectOption } from "@src/interfaces/components";
import { TriggerData } from "@src/types/models";
import { defaultTriggerSchema } from "@validations";

import { useFetchConnections, useFetchTrigger, useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Button, ErrorMessage, IconButton, Input, Loader } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";

import { InfoIcon, PlusCircle, TrashIcon } from "@assets/image/icons";

export const DefaultEditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useFileOperations(projectId!);
	const { connections, isLoading: isLoadingConnections } = useFetchConnections(
		projectId!,
		schedulerTriggerConnectionName
	);
	const { isLoading: isLoadingTrigger, trigger } = useFetchTrigger(triggerId!);

	const [triggerData, setTriggerData] = useState<TriggerData>({});
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
			reset({
				connection: { label: trigger.connectionName, value: trigger.connectionId },
				entryFunction: trigger.entryFunction,
				eventType: trigger.eventType,
				filePath: { label: trigger.path, value: trigger.path },
				filter: trigger.filter,
				name: trigger.name,
			});
			setTriggerData(trigger.data || {});
		}
	}, [trigger, connections, reset]);

	const onSubmit = async () => {
		const { connection, entryFunction, eventType, filePath, filter, name } = getValues();

		setIsSaving(true);
		const { error } = await TriggersService.update(projectId!, {
			connectionId: connection.value,
			data: triggerData,
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

	const updateTriggerDataKey = debounce((newKey: string, oldKey: string) => {
		if (newKey === oldKey) {
			return;
		}
		setTriggerData((prevData) => {
			const updatedTriggerData = { ...prevData };
			updatedTriggerData[newKey] = updatedTriggerData[oldKey];
			delete updatedTriggerData[oldKey];

			return updatedTriggerData;
		});
	}, 500);

	const updateTriggerDataValue = (key: string, value: string) => {
		setTriggerData((prevData) => ({
			...prevData,
			[key]: { string: { v: value } },
		}));
	};

	const handleAddNewData = () => {
		if (has(triggerData, "")) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("emptyKeyExist"),
				type: "error",
			});

			return;
		}
		setTriggerData((prevData) => ({
			...prevData,
			"": { string: { v: "" } },
		}));
	};

	const handleDeleteData = (key: string) => {
		setTriggerData((prevData) => {
			const updatedData = { ...prevData };
			delete updatedData[key];

			return updatedData;
		});
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

				<div>
					<div className="flex items-center gap-1 text-base text-gray-500">
						{t("titleData")}

						<div className="cursor-pointer" title={t("titleInfo")}>
							<InfoIcon className="fill-white" />
						</div>
					</div>

					<div className="mb-2 flex flex-col gap-2">
						{triggerData
							? Object.entries(triggerData).map(([key, value]) => (
									<div className="align-center flex gap-1" key={key}>
										<div className="flex w-full gap-6">
											<Input
												aria-label={t("placeholders.key")}
												className="w-full"
												defaultValue={key}
												label={t("placeholders.key")}
												onChange={(event) => updateTriggerDataKey(event.target.value, key)}
											/>

											<Input
												aria-label={t("placeholders.value")}
												className="w-full"
												defaultValue={value.string.v}
												label={t("placeholders.value")}
												onChange={(event) => updateTriggerDataValue(key, event.target.value)}
											/>
										</div>

										<IconButton
											ariaLabel={t("ariaDeleteData", { name: key })}
											className="self-center bg-gray-1300 hover:bg-black"
											onClick={() => handleDeleteData(key)}
										>
											<TrashIcon className="h-4 w-4 fill-white" />
										</IconButton>
									</div>
								))
							: null}
					</div>

					<Button
						className="group ml-auto w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
						onClick={handleAddNewData}
					>
						<PlusCircle className="h-5 w-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

						{t("buttonAddNewData")}
					</Button>
				</div>
			</form>
		</div>
	);
};
