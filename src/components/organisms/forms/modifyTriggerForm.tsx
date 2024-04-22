import React, { useState, useLayoutEffect, useEffect } from "react";
import { InfoIcon } from "@assets/image";
import { Select, ErrorMessage, Toast, Input } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, TriggersService } from "@services";
import { useProjectStore } from "@store";
import { Trigger } from "@type/models";
import { newTriggerSchema } from "@validations";
import { get, keys } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const ModifyTriggerForm = () => {
	const { triggerId } = useParams();
	const navigate = useNavigate();
	const {
		currentProject: { projectId, resources },
	} = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isLoading, setIsLoading] = useState(false);
	const [trigger, setTrigger] = useState<Trigger>();
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [filesName, setFilesName] = useState<SelectOption[]>([]);

	useLayoutEffect(() => {
		const fetchTrigger = async () => {
			const { data } = await TriggersService.get(triggerId!);
			if (!data) return;
			setTrigger(data);
		};

		fetchTrigger();
	}, []);

	useLayoutEffect(() => {
		const fetchData = async () => {
			const { data: connections, error } = await ConnectionService.listByProjectId(projectId!);
			if (!connections?.length) return;

			if (error) {
				setToast({ isOpen: true, message: tErrors("connectionsFetchError") });
				return;
			}

			const formattedConnections = connections.map((item) => ({
				value: item.connectionId,
				label: item.name,
			}));
			setConnections(formattedConnections);

			const formattedResources = Object.keys(resources).map((name) => ({
				value: name,
				label: name,
			}));
			setFilesName(formattedResources);
		};
		fetchData();
	}, []);

	const keyData = keys(get(trigger, "data"))[0] || "";
	const valueData = get(trigger, ["data", keyData, "string", "v"], "");

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		control,
		getValues,
		reset,
	} = useForm({
		resolver: zodResolver(newTriggerSchema),
		defaultValues: {
			connection: { value: "", label: "" },
			filePath: { value: "", label: "" },
			entryFunction: "",
			eventType: "",
			filter: "",
			key: keyData,
			value: valueData,
		},
	});

	useEffect(() => {
		reset({
			connection: { value: trigger?.connectionId, label: trigger?.connectionName },
			filePath: { value: trigger?.path, label: trigger?.path },
			entryFunction: trigger?.name,
			eventType: trigger?.eventType,
			filter: trigger?.filter,
		});
	}, [trigger]);

	const onSubmit = async () => {
		const { connection, filePath, entryFunction, eventType, filter, key, value } = getValues();

		setIsLoading(true);
		const { error } = await TriggersService.update(projectId!, {
			triggerId: trigger?.triggerId,
			connectionId: connection.value,
			eventType,
			path: filePath.label,
			name: entryFunction,
			filter,
			data: key ? { [key]: { string: { v: value } } } : {},
		});
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return (
		<div className="min-w-550">
			<TabFormHeader className="mb-11" form="modifyTriggerForm" isLoading={isLoading} title={t("modifyTrigger")} />
			<form className="flex items-start gap-10" id="modifyTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connection"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("placeholders.selectConnection")}
									isError={!!errors.connection}
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
									onChange={(selected) => field.onChange(selected)}
									options={filesName}
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
							aria-label={t("placeholders.entryFunction")}
							className={inputClass("entryFunction")}
							isError={!!errors.entryFunction}
							isRequired
							placeholder={t("placeholders.entryFunction")}
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
						<div className="flex items-center gap-1 text-gray-300 text-base">
							{t("titleData")}
							<div className="cursor-pointer" title={t("titleInfo")}>
								<InfoIcon className="fill-white" />
							</div>
						</div>
						<div className="flex gap-6">
							<div className="relative w-full">
								<Input
									{...register("key")}
									aria-label={t("placeholders.key")}
									className={inputClass("key")}
									isError={!!errors.key}
									placeholder={t("placeholders.key")}
								/>
								<ErrorMessage>{errors.key?.message as string}</ErrorMessage>
							</div>
							<div className="relative w-full">
								<Input
									{...register("value")}
									aria-label={t("placeholders.value")}
									className={inputClass("value")}
									isError={!!errors.value}
									placeholder={t("placeholders.value")}
								/>
								<ErrorMessage>{errors.value?.message as string}</ErrorMessage>
							</div>
						</div>
					</div>
				</div>
			</form>
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tErrors("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
