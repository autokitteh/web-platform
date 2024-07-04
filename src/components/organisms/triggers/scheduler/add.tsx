import React, { useState, useEffect } from "react";
import { ExternalLinkIcon } from "@assets/image/icons";
import { Select, ErrorMessage, Input, Loader, Link } from "@components/atoms";
import { infoCronExpressionsLinks, namespaces, schedulerTriggerConnectionName } from "@constants";
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
	const { t: tErrors } = useTranslation(["errors", "services"]);

	const [isLoading, setIsLoading] = useState(true);
	const [cronConnectionId, setCronConnectionId] = useState<string>();
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const { data: connections, error: connectionsError } = await ConnectionService.list();
				if (connectionsError) throw connectionsError;

				const connectionId = connections?.find((item) => item.name === schedulerTriggerConnectionName)?.connectionId;
				if (!connectionId) throw new Error(tErrors("connectionCronNotFound", { ns: "services" }));
				setCronConnectionId(connectionId);

				const formattedResources = Object.keys(resources).map((name) => ({
					value: name,
					label: name,
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
			filePath: { value: "", label: "" },
			entryFunction: "",
		},
	});

	const onSubmit = async () => {
		const { name, cron, filePath, entryFunction } = getValues();

		setIsSaving(true);
		const { error } = await TriggersService.create(projectId!, {
			triggerId: undefined,
			name,
			connectionId: cronConnectionId!,
			eventType: "",
			path: filePath.value,
			entryFunction,
			data: { ["schedule"]: { string: { v: cron } } },
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
				tErrors("triggerNotCreatedExtended", { projectId, error: (error as Error).message })
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
				<div className="flex flex-col items-start gap-2 mt-2">
					{infoCronExpressionsLinks.map(({ url, text }, idx) => (
						<Link
							className="inline-flex items-center ml-2 gap-2.5 group hover:text-green-accent"
							key={idx}
							target="_blank"
							to={url}
						>
							{text}
							<ExternalLinkIcon className="w-3.5 h-3.5 duration-200 fill-white group-hover:fill-green-accent" />
						</Link>
					))}
				</div>
			</div>
		</>
	);
};
