import React, { useRef, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { ChildFormRef } from "@interfaces/components/forms";
import { TriggerTypes } from "@src/enums";

import { useFetchConnections } from "@hooks";

import { ErrorMessage, Input } from "@components/atoms";
import { Select, TabFormHeader } from "@components/molecules";
import { AddWebhookTriggerForm, DefaultTriggerForm, SchedulerTriggerForm } from "@components/organisms/triggers";

export const AddTrigger = () => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const { t: tErrors } = useTranslation("errors");
	const [isSaving, setIsSaving] = useState(false);
	const { projectId } = useParams<{ projectId: string }>();

	const { connections, isLoading } = useFetchConnections(projectId!);
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
	const { connection, name } = watch();

	let TriggerFormComponent;

	switch (connection.value) {
		case TriggerTypes.schedule:
			TriggerFormComponent = SchedulerTriggerForm;
			break;
		case TriggerTypes.webhook:
			TriggerFormComponent = AddWebhookTriggerForm;
			break;
		default:
			TriggerFormComponent = DefaultTriggerForm;
			break;
	}

	const onSubmit = async () => {
		await childFormRef.current?.onSubmit();
	};

	return (
		<div className="min-w-80">
			<TabFormHeader
				className="mb-10"
				form="addTriggerForm"
				isLoading={isSaving || isLoading}
				title={t("addNewTrigger")}
			/>

			<form className="mb-6 flex w-full flex-col gap-6" id="addTriggerForm" onSubmit={handleSubmit(onSubmit)}>
				<div className="relative">
					<Input
						{...register("name", { required: tErrors("nameRequired") })}
						aria-label={t("placeholders.name")}
						isError={!!errors.name}
						label={t("placeholders.name")}
					/>

					<ErrorMessage>{errors.name?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Controller
						control={control}
						name="connection"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectConnection")}
								dataTestid="select-trigger-type"
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
							validate: ({ value }) => value !== "" || t("placeholders.selectConnection"),
						}}
					/>

					<ErrorMessage>{errors.connection?.message}</ErrorMessage>
				</div>
			</form>

			<TriggerFormComponent
				connectionId={connection.value}
				isSaving={isSaving}
				name={name}
				ref={childFormRef}
				setIsSaving={setIsSaving}
			/>
		</div>
	);
};

export default AddTrigger;
