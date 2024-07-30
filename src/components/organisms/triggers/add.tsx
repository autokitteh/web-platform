import React, { useEffect, useRef, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { namespaces, schedulerTriggerConnectionName } from "@constants";
import { TriggerFormType } from "@enums/components";
import { SelectOption } from "@interfaces/components";
import { ChildFormRef } from "@interfaces/components/forms";
import { ConnectionService, LoggerService } from "@services";

import { useToastStore } from "@store";

import { ErrorMessage, Input } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";
import { DefaultTriggerForm, TriggerSchedulerForm } from "@components/organisms/triggers";

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const [isSaving, setIsSaving] = useState(false);
	const [connections, setConnections] = useState<SelectOption[]>([]);
	const { projectId } = useParams<{ projectId: string }>();
	const { t: tErrors } = useTranslation("errors");
	const addToast = useToastStore((state) => state.addToast);
	const [cronConnectionId, setCronConnectionId] = useState<string>();
	const {
		control,
		formState: { errors },
		handleSubmit,
		register,
		watch,
	} = useForm({
		defaultValues: {
			connection: { label: "", value: "" },
			name: "",
		},
	});

	const childFormRef = useRef<ChildFormRef>(null);

	const fetchConnections = async () => {
		const { data: allConnectionsPerCustomer, error: allConnectionsError } = await ConnectionService.list();
		if (!allConnectionsPerCustomer || !allConnectionsPerCustomer.length) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionCronNotFound", { ns: "services" }),
				type: "error",
			});
			LoggerService.error(namespaces.triggerService, tErrors("connectionCronNotFound", { ns: "services" }));

			return;
		}
		if (allConnectionsError) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionsFetchError"),
				type: "error",
			});
			LoggerService.error(
				namespaces.triggerService,
				tErrors("connectionsFetchErrorExtended", { error: (allConnectionsError as Error).message, projectId })
			);

			return;
		}
		const cronConnection = allConnectionsPerCustomer.find((item) => item.name === schedulerTriggerConnectionName);
		if (!cronConnection) {
			addToast({
				id: Date.now().toString(),
				message: tErrors("connectionCronNotFound", { ns: "services" }),
				type: "error",
			});
			LoggerService.error(namespaces.triggerService, tErrors("connectionCronNotFound", { ns: "services" }));

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
				tErrors("connectionsFetchErrorExtended", { error: (allConnectionsError as Error).message, projectId })
			);

			return;
		}
		const formattedConnections = allConnectionsPerProject.map((item) => ({
			label: item.name,
			value: item.connectionId,
		}));
		const allConnectionsFormatted = [cronConnectionFormatted, ...formattedConnections];
		setConnections(allConnectionsFormatted || []);
	};

	useEffect(() => {
		fetchConnections();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { connection, name } = watch();

	const formTriggerComponents = {
		[TriggerFormType.default]: (
			<DefaultTriggerForm
				connectionId={connection.value}
				isSaving={isSaving}
				name={name}
				ref={childFormRef}
				setIsSaving={setIsSaving}
			/>
		),
		[TriggerFormType.scheduler]: (
			<TriggerSchedulerForm
				connectionId={connection.value}
				isSaving={isSaving}
				name={name}
				ref={childFormRef}
				setIsSaving={setIsSaving}
			/>
		),
	};

	const FormTriggerComponent =
		connection.value === cronConnectionId
			? formTriggerComponents[TriggerFormType.scheduler]
			: formTriggerComponents[TriggerFormType.default];

	const onSubmit = async () => {
		if (childFormRef.current) {
			await childFormRef.current.onSubmit();
		}
		// Handle parent form submission...
	};

	return (
		<div className="min-w-80">
			<TabFormHeader className="mb-10" form="addTriggerForm" isLoading={isSaving} title={t("addNewTrigger")} />

			<form className="mb-6 flex w-full flex-col gap-6" id="addTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name", { required: t("placeholders.name") })}
						aria-label={t("placeholders.name")}
						isError={!!errors.name}
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
								dataTestid="select-trigger-connection"
								isError={!!errors.connection}
								label={t("placeholders.connection")}
								noOptionsLabel={t("noConnectionsAvailable")}
								onChange={(selected) => field.onChange(selected)}
								options={connections}
								placeholder={t("placeholders.selectConnection")}
								value={field.value}
							/>
						)}
						rules={{
							required: t("placeholders.selectConnection"),
							validate: (value) => value?.value !== "" || t("placeholders.selectConnection"),
						}}
					/>

					<ErrorMessage>{errors.connection?.message as string}</ErrorMessage>
				</div>
			</form>

			{FormTriggerComponent}
		</div>
	);
};

AddTrigger.displayName = "AddTrigger";
export default AddTrigger;
