import React, { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { infoCronExpressionsLinks, namespaces, schedulerTriggerConnectionName } from "@constants";
import { TriggerFormIds } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { Trigger } from "@type/models";
import { schedulerTriggerSchema } from "@validations";

import { useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { ErrorMessage, Input, Link, Loader } from "@components/atoms";
import { Accordion, Select, TabFormHeader } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

export const SchedulerEditTrigger = () => {
	const { projectId, triggerId } = useParams();
	const navigate = useNavigate();
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const addToast = useToastStore((state) => state.addToast);
	const { fetchResources } = useFileOperations(projectId!);

	const [isSaving, setIsSaving] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [cronConnectionId, setCronConnectionId] = useState<string>();
	const [trigger, setTrigger] = useState<Trigger>();
	const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);
	const [connections, setConnections] = useState<SelectOption[]>([]);

	const fetchData = async () => {
		try {
			const { data: allConnectionsPerCustomer, error: allConnectionsError } = await ConnectionService.list();
			if (!allConnectionsPerCustomer || !allConnectionsPerCustomer.length) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("connectionsNotFound", { ns: "services" }),
					type: "error",
				});
				LoggerService.error(
					namespaces.connectionService,
					tErrors("connectionsNotFoundExtended", { ns: "services", projectId })
				);

				return;
			}
			if (allConnectionsError) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("connectionsFetchError"),
					type: "error",
				});

				return;
			}
			const cronConnection = allConnectionsPerCustomer.find(
				(item) => item.name === schedulerTriggerConnectionName
			);
			if (!cronConnection) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("connectionCronNotFound", { ns: "services" }),
					type: "error",
				});
				LoggerService.error(namespaces.triggersUI, tErrors("connectionCronNotFound", { ns: "services" }));

				return;
			}
			const cronConnectionFormatted = {
				label: t("cronSchedulerConnectionTitle"),
				value: cronConnection.connectionId,
			};
			setCronConnectionId(cronConnection.connectionId);
			const { data: allConnectionsPerProject, error: connectionsError } = await ConnectionService.listByProjectId(
				projectId!
			);
			if (connectionsError || !allConnectionsPerProject) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("connectionsFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.triggerService,
					tErrors("connectionsFetchErrorExtended", {
						error: (allConnectionsError as Error).message,
						projectId,
					})
				);

				return;
			}
			const formattedConnections = allConnectionsPerProject.map((item) => ({
				label: item.name,
				value: item.connectionId,
			}));
			const allConnectionsFormatted = [cronConnectionFormatted, ...formattedConnections];
			setConnections(allConnectionsFormatted || []);

			const resources = await fetchResources();

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
		formState: { errors },
		getValues,
		handleSubmit,
		register,
		reset,
		watch,
	} = useForm({
		defaultValues: {
			connection: { label: "", value: "" },
			cron: "",
			entryFunction: "",
			filePath: { label: "", value: "" },
			name: "",
		},
		resolver: zodResolver(schedulerTriggerSchema),
	});

	useEffect(() => {
		const selectedConnection = connections.find((item) => item.value === trigger?.connectionId);
		reset({
			cron: trigger?.data?.schedule?.string?.v,
			entryFunction: trigger?.entryFunction,
			filePath: { label: trigger?.path, value: trigger?.path },
			name: trigger?.name,
			connection: selectedConnection,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trigger, connections]);

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
				className="flex items-start gap-10"
				id={TriggerFormIds.modifySchedulerForm}
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="flex w-full flex-col gap-6">
					<div className="relative">
						<Controller
							control={control}
							name="connection"
							render={({ field }) => (
								<Select
									{...field}
									aria-label={t("placeholders.selectConnection")}
									dataTestid="select-trigger-connection"
									disabled
									isError={!!errors.connection}
									noOptionsLabel={t("noConnectionsAvailable")}
									onChange={(selected) => field.onChange(selected)}
									options={connections}
									placeholder={t("placeholders.selectConnection")}
									value={field.value}
								/>
							)}
						/>

						<ErrorMessage>{errors.connection?.message}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							{...register("name")}
							aria-label={t("placeholders.name")}
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
									label={t("placeholders.file")}
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
							isError={!!errors.entryFunction}
							isRequired
							placeholder={t("placeholders.functionName")}
						/>

						<ErrorMessage>{errors.entryFunction?.message as string}</ErrorMessage>
					</div>
				</div>
			</form>

			<Accordion className="mt-6" title={t("information")}>
				<div className="flex flex-col items-start gap-2">
					{infoCronExpressionsLinks.map(({ text, url }, index) => (
						<Link
							className="inline-flex items-center gap-2.5 text-green-800"
							key={index}
							target="_blank"
							to={url}
						>
							{text}

							<ExternalLinkIcon className="h-3.5 w-3.5 fill-green-800 duration-200" />
						</Link>
					))}
				</div>
			</Accordion>
		</div>
	);
};
