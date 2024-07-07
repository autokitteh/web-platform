import React, { useEffect, useState } from "react";

import { ExternalLinkIcon } from "@assets/image/icons";
import { ErrorMessage, Input, Link, Loader, Select } from "@components/atoms";
import { infoCronExpressionsLinks, namespaces, schedulerTriggerConnectionName } from "@constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { useProjectStore, useToastStore } from "@store";
import { schedulerTriggerSchema } from "@validations";
import { Controller, useForm } from "react-hook-form";
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
	const { t: tErrors } = useTranslation(["errors", "services"]);

	const [isLoading, setIsLoading] = useState(true);
	const [cronConnectionId, setCronConnectionId] = useState<string>();
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

	useEffect(() => {
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
				setIsLoading(false);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const {
		control,
		formState: { dirtyFields, errors },
		getValues,
		handleSubmit,
		register,
	} = useForm({
		defaultValues: {
			cron: "",
			entryFunction: "",
			filePath: { label: "", value: "" },
			name: "",
		},
		resolver: zodResolver(schedulerTriggerSchema),
	});

	const onSubmit = async () => {
		const { cron, entryFunction, filePath, name } = getValues();

		setIsSaving(true);
		const { error } = await TriggersService.create(projectId!, {
			connectionId: cronConnectionId!,
			data: { ["schedule"]: { string: { v: cron } } },
			entryFunction,
			eventType: "",
			name,
			path: filePath.value,
			triggerId: undefined,
		});
		setIsSaving(false);

		if (error) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("triggerNotCreated"),
				type: "error",
			});
			LoggerService.error(
				namespaces.triggerService,
				tErrors("triggerNotCreatedExtended", { error: (error as Error).message, projectId })
			);

			return;
		}
		navigate(`/projects/${projectId}/triggers`);
	};

	const inputClass = (field: keyof typeof dirtyFields) => (dirtyFields[field] ? "border-white" : "");

	return isLoading ? (
		<Loader isCenter size="xl" />
	) : (
		<>
			<form className="flex flex-col gap-6 w-full" id={formId} onSubmit={handleSubmit(onSubmit)}>
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
								dataTestid="select-file"
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
			</form>
			<div>
				<p className="text-lg">{t("information")}:</p>

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
		</>
	);
};
