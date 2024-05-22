import React, { useState, useLayoutEffect } from "react";
import { InfoIcon, PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";
import { Select, ErrorMessage, Toast, Input, Button, IconButton } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, ProjectsService, TriggersService } from "@services";
import { TriggerData } from "@type/models";
import { triggerSchema } from "@validations";
import { debounce, has } from "lodash";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const AddTriggerForm = () => {
	const navigate = useNavigate();
	const { projectId } = useParams();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const [filesName, setFilesName] = useState<SelectOption[]>([]);
	const [triggerData, setTriggerData] = useState<TriggerData>({});

	useLayoutEffect(() => {
		const fetchData = async () => {
			try {
				const { data: connections, error: connectionsError } = await ConnectionService.listByProjectId(projectId!);
				if (connectionsError) throw new Error(tErrors("connectionsFetchError"));
				if (!connections?.length) return;

				const formattedConnections = connections.map((item) => ({
					value: item.connectionId,
					label: item.name,
				}));
				setConnections(formattedConnections);

				const { data: resources, error: resourcesError } = await ProjectsService.getResources(projectId!);
				if (resourcesError) throw resourcesError;
				if (!resources) return;

				const formattedResources = Object.keys(resources).map((name) => ({
					value: name,
					label: name,
				}));
				setFilesName(formattedResources);
			} catch (error) {
				setToast({ isOpen: true, message: (error as Error).message });
			} finally {
				setIsLoadingData(false);
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
		resolver: zodResolver(triggerSchema),
		defaultValues: {
			name: "",
			connection: { value: "", label: "" },
			filePath: { value: "", label: "" },
			entryFunction: "",
			eventType: "",
			filter: "",
		},
	});

	const onSubmit = async () => {
		const { name, connection, filePath, entryFunction, eventType, filter } = getValues();

		setIsLoading(true);
		const { error } = await TriggersService.create(projectId!, {
			triggerId: undefined,
			name,
			connectionId: connection.value,
			eventType,
			path: filePath.label,
			entryFunction,
			filter,
			data: triggerData,
		});
		setIsLoading(false);

		if (error) {
			setToast({ isOpen: true, message: tErrors("triggerNotCreated") });
			return;
		}
		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	const updateTriggerDataKey = debounce((newKey, oldKey) => {
		if (newKey === oldKey) return;

		const updatedTriggerData = Object.keys(triggerData).reduce((triggers: TriggerData, key) => {
			if (key === oldKey) {
				triggers[newKey] = triggerData[key];
				return triggers;
			}

			triggers[key] = triggerData[key];
			return triggers;
		}, {});
		setTriggerData(updatedTriggerData);
	}, 500);

	const updateTriggerDataValue = (value: string, key: string) => {
		const updatedTriggerData = { ...triggerData };
		updatedTriggerData[key].string.v = value;
		setTriggerData(updatedTriggerData);
	};

	const handleAddNewData = () => {
		if (has(triggerData, "")) {
			setToast({ isOpen: true, message: t("errors.emptyKeyExist") });
			return;
		}

		const updatedTriggerData = { ...triggerData, [""]: { string: { v: "" } } };
		setTriggerData(updatedTriggerData);
	};

	const handleDeleteData = (key: string) => {
		setTriggerData((prevData) => {
			const updatedData = { ...prevData };
			delete updatedData[key];
			return updatedData;
		});
	};

	if (isLoadingData)
		return (
			<div className="font-semibold text-xl text-center flex flex-col h-full justify-center">{t("loading")}...</div>
		);

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" form="createNewTriggerForm" isLoading={isLoading} title={t("addNewTrigger")} />
			<form className="flex items-start gap-10" id="createNewTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col gap-6 w-full">
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
						<div className="flex items-center gap-1 text-gray-300 text-base">
							{t("titleData")}
							<div className="cursor-pointer" title={t("titleInfo")}>
								<InfoIcon className="fill-white" />
							</div>
						</div>
						<div className="flex flex-col gap-2 mb-2">
							{triggerData
								? Object.entries(triggerData).map(([key, value]) => (
										<div className="flex align-center gap-1" key={key}>
											<div className="flex gap-6 w-full">
												<Input
													aria-label={t("placeholders.key")}
													className="w-full"
													defaultValue={key}
													onChange={(e) => updateTriggerDataKey(e.target.value, key)}
													placeholder={t("placeholders.key")}
												/>
												<Input
													aria-label={t("placeholders.value")}
													className="w-full"
													defaultValue={value.string.v}
													onChange={(e) => updateTriggerDataValue(e.target.value, key)}
													placeholder={t("placeholders.value")}
												/>
											</div>
											<IconButton
												ariaLabel={t("ariaDeleteData", { name: key })}
												className="hover:bg-black bg-black-900 self-center"
												onClick={() => handleDeleteData(key)}
											>
												<TrashIcon className="fill-white w-4 h-4" />
											</IconButton>
										</div>
									))
								: null}
						</div>
						<Button
							className="w-auto ml-auto group gap-1 p-0 font-semibold text-gray-300 hover:text-white"
							onClick={handleAddNewData}
							type="button"
						>
							<PlusCircle className="transtion duration-300 stroke-gray-300 group-hover:stroke-white w-5 h-5" />
							{t("buttonAddNewData")}
						</Button>
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
