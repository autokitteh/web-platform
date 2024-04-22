import React, { useState, useLayoutEffect } from "react";
import { Select, ErrorMessage, Toast, Input } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, TriggersService } from "@services";
import { useProjectStore } from "@store";
import { newTriggerSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const AddTriggerForm = () => {
	const navigate = useNavigate();
	const {
		currentProject: { projectId, resources },
	} = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const { t } = useTranslation(["errors", "buttons", "forms"]);
	const [isLoading, setIsLoading] = useState(false);
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [filesName, setFilesName] = useState<SelectOption[]>([]);

	useLayoutEffect(() => {
		const fetchData = async () => {
			const { data: connections, error } = await ConnectionService.list();

			if (error || !connections?.length) {
				setToast({ isOpen: true, message: t("connectionsFetchError") });
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		control,
		getValues,
	} = useForm({
		resolver: zodResolver(newTriggerSchema),
		defaultValues: {
			connection: { value: "", label: "" },
			filePath: { value: "", label: "" },
			entryPoint: "",
			eventType: "",
		},
	});

	const onSubmit = async () => {
		const { connection, filePath, eventType, entryPoint } = getValues();
		setIsLoading(true);
		const { error } = await TriggersService.create(projectId!, {
			triggerId: undefined,
			connectionId: connection.value,
			eventType,
			path: filePath.label,
			name: entryPoint,
		});
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: t("triggerNotCreated") });
			return;
		}

		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return (
		<div className="min-w-550">
			<TabFormHeader
				className="mb-11"
				form="createNewTriggerForm"
				isLoading={isLoading}
				title={t("triggers.addNewTrigger", { ns: "forms" })}
			/>
			<form className="flex items-start gap-10" id="createNewTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connection"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("triggers.ariaSelectConnection", { ns: "forms" })}
									isError={!!errors.connection}
									onChange={(selected) => field.onChange(selected)}
									options={connections}
									placeholder={t("triggers.placeholderSelectConnection", { ns: "forms" })}
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
									aria-label={t("triggers.ariaSelectFile", { ns: "forms" })}
									isError={!!errors.filePath}
									onChange={(selected) => field.onChange(selected)}
									options={filesName}
									placeholder={t("triggers.placeholderSelectFile", { ns: "forms" })}
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.filePath?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("entryPoint")}
							aria-label={t("triggers.entrypoint", { ns: "forms" })}
							className={inputClass("entryPoint")}
							isError={!!errors.entryPoint}
							placeholder={t("triggers.placeholderEntrypoint", { ns: "forms" })}
						/>
						<ErrorMessage>{errors.entryPoint?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("eventType")}
							aria-label={t("triggers.eventType", { ns: "forms" })}
							className={inputClass("eventType")}
							isError={!!errors.eventType}
							placeholder={t("triggers.placeholderEventType", { ns: "forms" })}
						/>
						<ErrorMessage>{errors.eventType?.message as string}</ErrorMessage>
					</div>
				</div>
			</form>
			<Toast
				className="border-error"
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
			>
				<p className="font-semibold text-error">{t("error")}</p>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
