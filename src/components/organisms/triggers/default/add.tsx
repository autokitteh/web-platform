import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { namespaces } from "@constants";
import { SelectOption } from "@interfaces/components";
import { ChildFormRef, DefaultTriggerFormProps } from "@interfaces/components/forms";
import { LoggerService, TriggersService } from "@services";
import { defaultTriggerSchema } from "@validations";

import { useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { ErrorMessage, Input, Loader } from "@components/atoms";
import { Select } from "@components/molecules";

export const DefaultTriggerForm = forwardRef<ChildFormRef, DefaultTriggerFormProps>(
	({ connectionId, isSaving, name, setIsSaving }, ref) => {
		const navigate = useNavigate();
		const { projectId } = useParams<{ projectId: string }>();
		const addToast = useToastStore((state) => state.addToast);
		const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
		const { t: tErrors } = useTranslation("errors");
		const { fetchResources } = useFileOperations(projectId!);
		const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

		const fetchData = async () => {
			try {
				const resources = await fetchResources();
				const formattedResources = Object.keys(resources).map((name) => ({
					label: name,
					value: name,
				}));
				setFilesNameList(formattedResources);
			} catch (error) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("resourcesFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.triggerService,
					tErrors("cresourcesFetchErrorExtended", { error: (error as Error).message, projectId })
				);
			} finally {
				setIsSaving(false);
			}
		};

		useEffect(() => {
			setIsSaving(true);
			fetchData();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		const {
			control,
			formState: { errors },
			getValues,
			handleSubmit,
			register,
			watch,
		} = useForm({
			defaultValues: {
				entryFunction: "",
				eventType: "",
				filePath: { label: "", value: "" },
				filter: "",
			},
			resolver: zodResolver(defaultTriggerSchema),
		});

		const onSubmit = async () => {
			const { entryFunction, eventType, filePath, filter } = getValues();
			setIsSaving(true);
			const { error } = await TriggersService.create(projectId!, {
				connectionId,
				entryFunction,
				eventType,
				filter,
				path: filePath.value,
				triggerId: undefined,
				name,
			});
			setIsSaving(false);
			if (error) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("triggerNotCreated"),
					type: "error",
				});

				return;
			}
			navigate(-1);
		};

		useImperativeHandle(ref, () => ({
			onSubmit: handleSubmit(onSubmit),
		}));

		const { entryFunction, eventType, filter } = watch();

		return isSaving ? (
			<Loader isCenter size="xl" />
		) : (
			<form className="flex w-full flex-col gap-6">
				<div className="relative">
					<Controller
						control={control}
						name="filePath"
						render={({ field }) => (
							<Select
								{...field}
								aria-label={t("placeholders.selectFile")}
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
						{...register("entryFunction")}
						aria-label={t("placeholders.functionName")}
						isError={!!errors.entryFunction}
						isRequired
						label={t("placeholders.functionName")}
						value={entryFunction}
					/>

					<ErrorMessage>{errors.entryFunction?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("eventType")}
						aria-label={t("placeholders.eventType")}
						isError={!!errors.eventType}
						label={t("placeholders.eventType")}
						value={eventType}
					/>

					<ErrorMessage>{errors.eventType?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("filter")}
						aria-label={t("placeholders.filter")}
						isError={!!errors.filter}
						label={t("placeholders.filter")}
						value={filter}
					/>

					<ErrorMessage>{errors.filter?.message}</ErrorMessage>
				</div>
			</form>
		);
	}
);

DefaultTriggerForm.displayName = "DefaultTriggerForm";
