import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { infoCronExpressionsLinks, namespaces } from "@constants";
import { SelectOption } from "@interfaces/components";
import { ChildFormRef } from "@interfaces/components/forms";
import { LoggerService, TriggersService } from "@services";
import { schedulerTriggerSchema } from "@validations";

import { useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { ErrorMessage, Input, Link, Loader } from "@components/atoms";
import { Accordion, Select } from "@components/molecules";

import { ExternalLinkIcon } from "@assets/image/icons";

interface TriggerSchedulerFormProps {
	connectionId: string;
	isSaving: boolean;
	name: string;
	setIsSaving: (isSaving: boolean) => void;
}

export const TriggerSchedulerForm = forwardRef<ChildFormRef, TriggerSchedulerFormProps>(
	({ connectionId, isSaving, name, setIsSaving }, ref) => {
		const navigate = useNavigate();
		const { projectId } = useParams<{ projectId: string }>();
		const addToast = useToastStore((state) => state.addToast);
		const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
		const { t: tErrors } = useTranslation(["errors", "services"]);
		const { fetchResources } = useFileOperations(projectId!);
		const [filesNameList, setFilesNameList] = useState<SelectOption[]>([]);

		useEffect(() => {
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
						message: tErrors("connectionsFetchError"),
						type: "error",
					});
					LoggerService.error(
						namespaces.triggerService,
						tErrors("connectionsFetchErrorExtended", { error: (error as Error).message, projectId })
					);
				} finally {
					setIsSaving(false);
				}
			};
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
				cron: "",
				entryFunction: "",
				filePath: { label: "", value: "" },
			},
			resolver: zodResolver(schedulerTriggerSchema),
		});

		const onSubmit = async () => {
			const { cron, entryFunction, filePath } = getValues();
			setIsSaving(true);
			const { error } = await TriggersService.create(projectId!, {
				connectionId,
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

		useImperativeHandle(ref, () => ({
			onSubmit: handleSubmit(onSubmit),
		}));

		const { cron, entryFunction } = watch();

		return isSaving ? (
			<Loader isCenter size="xl" />
		) : (
			<>
				<form className="flex w-full flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
					<div className="relative">
						<Input
							{...register("cron")}
							aria-label={t("placeholders.cron")}
							isError={!!errors.cron}
							isRequired
							placeholder={t("placeholders.cron")}
							value={cron}
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
							placeholder={t("placeholders.functionName")}
							value={entryFunction}
						/>

						<ErrorMessage>{errors.entryFunction?.message as string}</ErrorMessage>
					</div>
				</form>
				<Accordion title={t("information")}>
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
			</>
		);
	}
);

TriggerSchedulerForm.displayName = "TriggerSchedulerForm";
