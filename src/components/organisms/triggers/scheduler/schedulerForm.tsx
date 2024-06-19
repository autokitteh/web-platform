import React, { useState, useEffect } from "react";
import { Select, ErrorMessage, Input } from "@components/atoms";
import { namespaces } from "@constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { schedulerTriggerSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const TriggerSchedulerForm = ({
	formId,
	setIsSaving,
}: {
	formId: string;
	setIsSaving: (event: boolean) => void;
}) => {
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { resources } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");

	const [isLoading, setIsLoading] = useState(true);
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [filesName, setFilesName] = useState<SelectOption[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: connections, error: connectionsError } = await ConnectionService.listByProjectId(projectId!);
				if (connectionsError) throw connectionsError;
				if (!connections?.length) return;

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
			} catch (error) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("connectionsFetchError"),
					type: "error",
					title: tErrors("error"),
				});
				LoggerService.error(
					namespaces.triggerService,
					tErrors("connectionsFetchErrorExtended", { projectId, error: (error as Error).message })
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		control,
		getValues,
	} = useForm({
		resolver: zodResolver(schedulerTriggerSchema),
		defaultValues: {
			name: "",
			cron: "",
			connection: { value: "", label: "" },
			filePath: { value: "", label: "" },
			entryFunction: "",
		},
	});

	const onSubmit = async () => {
		const { name, cron, connection, filePath, entryFunction } = getValues();

		setIsSaving(true);
		const { error } = await TriggersService.create(projectId!, {
			triggerId: undefined,
			name,
			connectionId: connection.value,
			eventType: "",
			path: filePath.label,
			entryFunction,
			data: { ["schedule"]: { string: { v: cron } } },
		});
		setIsSaving(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("triggerNotCreated"),
				type: "error",
				title: tErrors("error"),
			});
			LoggerService.error(
				namespaces.triggerService,
				tErrors("triggerNotCreatedExtended", { projectId, error: (error as Error).message })
			);
			return;
		}
		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return isLoading ? (
		<div className="flex flex-col justify-center h-full text-xl font-semibold text-center">{t("loading")}...</div>
	) : (
		<form className="flex flex-col w-full gap-6" id={formId} onSubmit={handleSubmit(onSubmit)}>
			<div className="relative">
				<Input
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
				<Input
					{...register("cron")}
					aria-label={t("placeholders.cron")}
					className={inputClass("cron")}
					isError={!!errors.cron}
					isRequired
					placeholder={t("placeholders.cron")}
				/>
				<ErrorMessage>{errors.cron?.message as string}</ErrorMessage>
			</div>
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
							ref={null}
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
							ref={null}
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
		</form>
	);
};
