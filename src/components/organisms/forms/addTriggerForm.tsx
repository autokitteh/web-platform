import React, { useState, useLayoutEffect } from "react";
import { ArrowLeft } from "@assets/image/icons";
import { Select, Button, ErrorMessage, IconButton, Toast, Input } from "@components/atoms";
import { namespaces } from "@constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ISelectOption } from "@interfaces/components";
import { ConnectionService, TriggersService, LoggerService } from "@services";
import { useProjectStore } from "@store";
import { newTriggerSchema } from "@validations";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export const AddTriggerForm = () => {
	const navigate = useNavigate();
	const {
		currentProject: { projectId },
	} = useProjectStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const { t } = useTranslation("errors");
	const [isLoading, setIsLoading] = useState(false);
	const [list, setList] = useState<{ connections: ISelectOption[]; filesName: ISelectOption[] }>({
		connections: [],
		filesName: [],
	});

	useLayoutEffect(() => {
		const fetchData = async () => {
			const { data: connections, error } = await ConnectionService.list();

			if (error) {
				setToast({ isOpen: true, message: t("connectionNotFound") });
				LoggerService.error(
					namespaces.projectUI,
					t("connectionNotFound", { projectId: projectId, error: (error as Error).message })
				);
				return;
			}

			const formattedConnections = connections?.map((item) => ({
				value: item.connectionId,
				label: item.name,
			}));

			setList((prevState) => ({ ...prevState, connections: formattedConnections || [] }));
		};
		fetchData();
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		control,
	} = useForm({
		resolver: zodResolver(newTriggerSchema),
		defaultValues: {
			connectionApp: { value: "", label: "" },
			name: "",
			path: "",
			eventType: "",
		},
	});

	const onSubmit = async ({ connectionApp, eventType, path, name }: FieldValues) => {
		setIsLoading(true);
		const { error } = await TriggersService.create(projectId!, {
			connectionId: connectionApp[0].value,
			connectionName: connectionApp[0].label,
			eventType,
			path,
			name,
		});
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: t("triggerNotCreated") });
			LoggerService.error(
				namespaces.triggerService,
				t("triggerNotCreated", { projectId: projectId, error: (error as Error).message })
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
					<p className="text-gray-300 text-base">Add new trigger</p>
				</div>
				<div className="flex items-center gap-6">
					<Button className="text-gray-300 hover:text-white p-0 font-semibold" onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button
						className="px-4 py-2 font-semibold text-white border-white hover:bg-black"
						disabled={isLoading}
						form="saveForm"
						variant="outline"
					>
						{isLoading ? "Loading..." : "Save"}
					</Button>
				</div>
			</div>
			<form className="flex items-start gap-10" id="saveForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Controller
							control={control}
							name="connectionApp"
							render={({ field }) => (
								<Select
									{...field}
									isError={!!errors.connectionApp}
									onChange={(selected) => {
										field.onChange(selected);
									}}
									options={list.connections}
									placeholder="Select connection"
									value={field.value}
								/>
							)}
						/>
						<ErrorMessage>{errors.connectionApp?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("name")}
							className={inputClass("name")}
							isError={!!errors.name}
							placeholder="File Name"
						/>
						<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("path")}
							className={inputClass("path")}
							isError={!!errors.path}
							placeholder="Entrypoint"
						/>
						<ErrorMessage>{errors.path?.message as string}</ErrorMessage>
					</div>
					<div className="relative">
						<Input
							{...register("eventType")}
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
