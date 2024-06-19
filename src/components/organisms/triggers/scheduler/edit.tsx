import React, { useState, useLayoutEffect, useEffect } from "react";
import { Select, ErrorMessage, Input } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, TriggersService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { Trigger } from "@type/models";
import { triggerSchedulerSchema } from "@validations";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const SchedulerEditTrigger = () => {
	const { triggerId, projectId } = useParams();
	const navigate = useNavigate();
	const { resources } = useProjectStore();
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [trigger, setTrigger] = useState<Trigger>();
	const [filesName, setFilesName] = useState<SelectOption[]>([]);
	const addToast = useToastStore((state) => state.addToast);

	useLayoutEffect(() => {
		const fetchTrigger = async () => {
			const { data } = await TriggersService.get(triggerId!);
			if (!data) return;
			setTrigger(data);
		};

		fetchTrigger();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

	useLayoutEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		register,
		handleSubmit,
		formState: { errors, dirtyFields },
		control,
		getValues,
		reset,
	} = useForm({
		resolver: zodResolver(triggerSchedulerSchema),
		defaultValues: {
			name: "",
			cron: "",
			filePath: { value: "", label: "" },
			entryFunction: "",
		},
	});

	useEffect(() => {
		const resetForm = () => {
			reset({
				name: trigger?.name,
				filePath: { value: trigger?.path, label: trigger?.path },
				entryFunction: trigger?.entryFunction,
			});
		};

		resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger]);

	const onSubmit = async () => {
		const { filePath, name, entryFunction } = getValues();

		setIsLoading(true);
		const { error } = await TriggersService.update(projectId!, {
			triggerId: trigger?.triggerId,
			name,
			connectionId: "",
			eventType: "",
			path: filePath.label,
			entryFunction,
		});
		setIsLoading(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}

		navigate(-1);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return isLoadingData ? (
		<div className="flex flex-col justify-center h-full text-xl font-semibold text-center">{t("loading")}...</div>
	) : (
		<div className="min-w-80">
			<TabFormHeader className="mb-11" form="modifyTriggerForm" isLoading={isLoading} title={t("modifyTrigger")} />
			<form className="flex items-start gap-10" id="modifyTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col w-full gap-6">
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
				</div>
			</form>
		</div>
	);
};
