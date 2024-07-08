import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { debounce, has } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { namespaces } from "@constants";
import { TriggerFormIds } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { Trigger, TriggerData } from "@type/models";
import { defaultTriggerSchema } from "@validations";

import { Button, ErrorMessage, IconButton, Input, Loader, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";

import { InfoIcon, PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const DefaultEditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { resources } = useProjectStore();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const addToast = useToastStore((state) => state.addToast);

	const [trigger, setTrigger] = useState<Trigger>();
	const [triggerData, setTriggerData] = useState<TriggerData>({});
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

	const fetchData = async () => {
		try {
			const { data: connections, error: connectionsError } = await ConnectionService.listByProjectId(projectId!);
			if (connectionsError) {
				throw connectionsError;
			}

			const formattedConnections = connections?.map((item) => ({
				label: item.name,
				value: item.connectionId,
			}));
			setConnections(formattedConnections || []);

			const formattedResources = Object.keys(resources).map((name) => ({
				label: name,
				value: name,
			}));
			setFilesNameList(formattedResources);
		} catch (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionsFetchError"),
				type: "error",
			});
			LoggerService.error(namespaces.triggerService, tErrors("connectionsFetchErrorExtended", { error: (error as Error).message, projectId }));
		} finally {
			setIsLoadingData(false);
		}
	};

	const fetchTrigger = async () => {
		const { data } = await TriggersService.get(triggerId!);
		if (!data) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("triggerNotFound"),
				type: "error",
			});
			LoggerService.error(namespaces.triggerService, tErrors("triggerNotFoundExtended", { triggerId }));

			return;
		}
		setTrigger(data);
		setTriggerData(data.data || {});
	};

	useEffect(() => {
		fetchTrigger();
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		control,
		formState: { dirtyFields, errors },
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
		const resetForm = () => {
			reset({
				connection: { label: trigger?.connectionName, value: trigger?.connectionId },
				entryFunction: trigger?.entryFunction,
				eventType: trigger?.eventType,
				filePath: { label: trigger?.path, value: trigger?.path },
				filter: trigger?.filter,
				name: trigger?.name,
			});
		};

		resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger]);

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

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	const updateTriggerDataKey = debounce((newKey, oldKey) => {
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

	return isLoadingData ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" form={TriggerFormIds.modifyDefaultForm} isLoading={isSaving} title={t("modifyTrigger")} />

			<form className="flex items-start gap-10" id={TriggerFormIds.modifyDefaultForm} onSubmit={handleSubmit(onSubmit)}>
				<div className="flex w-full flex-col gap-6">
					<div className="relative">
						<Input
							disabled
							{...register("name")}
							aria-label={t("placeholders.name")}
							className={inputClass("name")}
							isError={!!errors.name}
							isRequired
							placeholder={t("placeholders.name")}
						/>

						<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Controller
							control={control}
							name="connection"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("placeholders.selectConnection")}
									dataTestid="select-trigger-connection"
									isError={!!errors.connection}
									noOptionsLabel={t("noConnectionsAvailable")}
									onChange={(selected) => field.onChange(selected)}
									options={connections}
									placeholder={t("placeholders.selectConnection")}
									value={field.value}
								/>
							)}
						/>

						<ErrorMessage>{errors.connection?.message as string}</ErrorMessage>
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
									noOptionsLabel={t("noFilesAvailable")}
									onChange={(selected) => field.onChange(selected)}
									options={filesNameList}
									placeholder={t("placeholders.selectFile")}
									value={field.value}
								/>
							)}
						/>

						<ErrorMessage>{errors.filePath?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							{...register("entryFunction")}
							aria-label={t("placeholders.functionName")}
							className={inputClass("entryFunction")}
							isError={!!errors.entryFunction}
							isRequired
							placeholder={t("placeholders.functionName")}
						/>

						<ErrorMessage>{errors.entryFunction?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							{...register("eventType")}
							aria-label={t("placeholders.eventType")}
							className={inputClass("eventType")}
							isError={!!errors.eventType}
							placeholder={t("placeholders.eventType")}
						/>

						<ErrorMessage>{errors.eventType?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							{...register("filter")}
							aria-label={t("placeholders.filter")}
							className={inputClass("filter")}
							isError={!!errors.filter}
							placeholder={t("placeholders.filter")}
						/>

						<ErrorMessage>{errors.filter?.message as string}</ErrorMessage>
					</div>

					<div>
						<div className="flex items-center gap-1 text-base text-gray-300">
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
													onChange={(event) => updateTriggerDataKey(event.target.value, key)}
													placeholder={t("placeholders.key")}
												/>

												<Input
													aria-label={t("placeholders.value")}
													className="w-full"
													defaultValue={value.string.v}
													onChange={(event) => updateTriggerDataValue(key, event.target.value)}
													placeholder={t("placeholders.value")}
												/>
											</div>

											<IconButton
												ariaLabel={t("ariaDeleteData", { name: key })}
												className="self-center bg-black-900 hover:bg-black"
												onClick={() => handleDeleteData(key)}
											>
												<TrashIcon className="h-4 w-4 fill-white" />
											</IconButton>
										</div>
									))
								: null}
						</div>

						<Button className="group ml-auto w-auto gap-1 p-0 font-semibold text-gray-300 hover:text-white" onClick={handleAddNewData}>
							<PlusCircle className="h-5 w-5 stroke-gray-300 duration-300 group-hover:stroke-white" />

							{t("buttonAddNewData")}
						</Button>
					</div>
				</div>
			</form>
		</div>
	);
};
