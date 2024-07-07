import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { infoCronExpressionsLinks, namespaces, schedulerTriggerConnectionName } from "@constants";
import { TriggerFormIds } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { Trigger } from "@type/models";
import { schedulerTriggerSchema } from "@validations";

import { ErrorMessage, Input, Link, Loader, Select } from "@components/atoms";
import { TabFormHeader } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const SchedulerEditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { resources } = useProjectStore();
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const addToast = useToastStore((state) => state.addToast);

	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [cronConnectionId, setCronConnectionId] = useState<string>();
	const [trigger, setTrigger] = useState<Trigger>();
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

	const fetchData = async () => {
		try {
			const { data: connections, error: connectionsError } = await ConnectionService.list();
			if (connectionsError) {
				throw connectionsError;
			}

			const connectionId = connections?.find(
				(item) => item.name === schedulerTriggerConnectionName
			)?.connectionId;
			if (!connectionId) {
				throw new Error(tErrors("connectionCronNotFound", { ns: "services" }));
			}
			setCronConnectionId(connectionId);

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
			LoggerService.error(
				namespaces.triggerService,
				tErrors("connectionsFetchErrorExtended", { error: (error as Error).message, projectId })
			);
		} finally {
			setIsLoadingData(false);
		}
	};

	useEffect(() => {
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
		};

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
		watch,
	} = useForm({
		defaultValues: {
			cron: "",
			entryFunction: "",
			filePath: { label: "", value: "" },
			name: "",
		},
		resolver: zodResolver(schedulerTriggerSchema),
	});

	useEffect(() => {
		reset({
			cron: trigger?.data?.schedule?.string?.v,
			entryFunction: trigger?.entryFunction,
			filePath: { label: trigger?.path, value: trigger?.path },
			name: trigger?.name,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger]);

	const onSubmit = async () => {
		const { cron, entryFunction, filePath, name } = getValues();
		setIsSaving(true);
		const { error } = await TriggersService.update(projectId!, {
			connectionId: cronConnectionId!,
			data: { ["schedule"]: { string: { v: cron } } },
			entryFunction,
			eventType: "",
			name,
			path: filePath.value,
			triggerId: triggerId!,
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

		navigate(`/projects/${projectId}/triggers`);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	const { cron, entryFunction, name } = watch();

	return isLoadingData ? (
		<Loader isCenter size="xl" />
	) : (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-11"
				form={TriggerFormIds.modifySchedulerForm}
				isLoading={isSaving}
				title={t("modifyTrigger")}
			/>

			<form
				className="flex gap-10 items-start"
				id={TriggerFormIds.modifySchedulerForm}
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="flex flex-col gap-6 w-full">
					<div className="relative">
						<Input
							{...register("name")}
							aria-label={t("placeholders.name")}
							className={inputClass("name")}
							disabled
							isError={!!errors.name}
							isRequired
							placeholder={t("placeholders.name")}
							value={name}
						/>

						<ErrorMessage>{errors.name?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							value={cron}
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
									dataTestid="select-trigger-file"
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
							value={entryFunction}
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

			<p className="mt-6 text-lg">{t("information")}:</p>

			<div className="flex flex-col gap-2 items-start mt-2">
				{infoCronExpressionsLinks.map(({ text, url }, index) => (
					<Link
						className="gap-2.5 group hover:text-green-accent inline-flex items-center ml-2"
						key={index}
						target="_blank"
						to={url}
					>
						{text}

						<ExternalLinkIcon className="duration-200 fill-white group-hover:fill-green-accent h-3.5 w-3.5" />
					</Link>
				))}
			</div>
		</div>
	);
};
