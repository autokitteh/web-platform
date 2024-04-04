import React, { useState, useLayoutEffect } from "react";
import { ArrowLeft } from "@assets/image/icons";
import { Select, Button, ErrorMessage, IconButton, Toast, Input } from "@components/atoms";
import { namespaces } from "@constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ISelectOption } from "@interfaces/components";
import { ConnectionService, TriggersService, LoggerService } from "@services";
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
	const [connections, setConnections] = useState<ISelectOption[]>([]);
	const [filesName, setFilesName] = useState<ISelectOption[]>([]);

	useLayoutEffect(() => {
		const fetchData = async () => {
			const { data: connections, error } = await ConnectionService.list();
			const formattedConnections = connections?.map((item) => ({
				value: item.connectionId,
				label: item.name,
			}));
			setConnections(formattedConnections || []);

			if (error) {
				setToast({ isOpen: true, message: t("connectionsNotFound") });
				LoggerService.error(
					namespaces.projectUI,
					t("connectionsNotFoundExtended", { projectId: projectId, error: (error as Error).message })
				);
			}

			const resourceNames = Object.keys(resources || []);
			const formattedResources = resourceNames?.map((name) => ({
				value: name,
				label: name,
			}));
			setFilesName(formattedResources || []);
		};
		fetchData();
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
			name: { value: "", label: "" },
			entryPoint: "",
			eventType: "",
		},
	});

	const onSubmit = async () => {
		const { connection, name, eventType, entryPoint } = getValues();
		setIsLoading(true);
		const { error } = await TriggersService.create(projectId!, {
			triggerId: undefined,
			connectionId: connection.value,
			connectionName: connection.label,
			eventType,
			path: entryPoint,
			name: name.label,
		});
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: t("triggerNotCreated") });
			LoggerService.error(
				namespaces.triggerService,
				t("triggerNotCreatedExtended", { projectId: projectId, error: (error as Error).message })
			);
			return;
		}

		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return (
		<div className="min-w-550">
			<div className="flex justify-between mb-11">
				<div className="flex items-center gap-1">
					<IconButton className="hover:bg-black p-0 w-8 h-8" onClick={() => navigate(-1)}>
						<ArrowLeft />
					</IconButton>
					<p className="text-gray-300 text-base">{t("addNewTrigger", { ns: "forms" })}</p>
				</div>
				<div className="flex items-center gap-6">
					<Button className="text-gray-300 hover:text-white p-0 font-semibold" onClick={() => navigate(-1)}>
						{t("cancel", { ns: "forms" })}
					</Button>
					<Button
						ariaLabel="Save trigger"
						className="px-4 py-2 font-semibold text-white border-white hover:bg-black"
						disabled={isLoading}
						form="createNewTriggerForm"
						variant="outline"
					>
						{isLoading ? t("loading", { ns: "buttons" }) + "..." : t("save", { ns: "buttons" })}
					</Button>
				</div>
			</div>
			<form className="flex items-start gap-10" id="createNewTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connection"
							render={({ field }) => (
								<Select
									{...field}
									aria-label="Select connection"
									isError={!!errors.connection}
									onChange={(selected) => field.onChange(selected)}
									options={connections}
									placeholder="Select connection"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connection?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Controller
							control={control}
							name="name"
							render={({ field }) => (
								<Select
									{...field}
									aria-label="Select file"
									isError={!!errors.name}
									onChange={(selected) => field.onChange(selected)}
									options={filesName}
									placeholder="Select file"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("entryPoint")}
							aria-label="Entrypoint"
							className={inputClass("entryPoint")}
							isError={!!errors.entryPoint}
							placeholder="Entrypoint"
						/>
						<ErrorMessage>{errors.entryPoint?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("eventType")}
							aria-label="Event Type"
							className={inputClass("eventType")}
							isError={!!errors.eventType}
							placeholder="Event Type"
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
