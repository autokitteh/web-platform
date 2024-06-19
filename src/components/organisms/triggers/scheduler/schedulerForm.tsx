import React, { useState, useLayoutEffect } from "react";
import { Select, ErrorMessage, Input } from "@components/atoms";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, TriggersService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { triggerSchedulerSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const TriggerSchedulerForm = ({
	formId,
	setIsLoading,
}: {
	formId: string;
	setIsLoading: (event: boolean) => void;
}) => {
	const navigate = useNavigate();
	const { projectId } = useParams();
	const { resources } = useProjectStore();
	const addToast = useToastStore((state) => state.addToast);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");

	const [isLoadingData, setIsLoadingData] = useState(true);
	const [filesName, setFilesName] = useState<SelectOption[]>([]);

	useLayoutEffect(() => {
		const fetchData = async () => {
			try {
				const { data: connections, error: connectionsError } = await ConnectionService.listByProjectId(projectId!);
				if (connectionsError) throw new Error(tErrors("connectionsFetchError"));
				if (!connections?.length) return;

				const formattedResources = Object.keys(resources).map((name) => ({
					value: name,
					label: name,
				}));
				setFilesName(formattedResources);
			} catch (error) {
				addToast({
					id: Date.now().toString(),
					message: (error as Error).message,
					type: "error",
					title: tErrors("error"),
				});
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
		resolver: zodResolver(triggerSchedulerSchema),
		defaultValues: {
			name: "",
			cron: "",
			filePath: { value: "", label: "" },
			entryFunction: "",
		},
	});

	const onSubmit = async () => {
		const { name, filePath, entryFunction, cron } = getValues();

		setIsLoading(true);
		const { error } = await TriggersService.create(projectId!, {
			triggerId: undefined,
			name,
			connectionId: "",
			eventType: "",
			path: filePath.label,
			entryFunction,
			data: { ["schedule"]: { string: { v: cron } } },
		});
		setIsLoading(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("triggerNotCreated") + (error as Error).message,
				type: "error",
				title: t("error"),
			});
			return;
		}
		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return isLoadingData ? (
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
