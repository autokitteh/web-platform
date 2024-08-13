import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { debounce, has } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { namespaces } from "@constants";
import { SelectOption } from "@interfaces/components";
import { ChildFormRef, DefaultTriggerFormProps } from "@interfaces/components/forms";
import { LoggerService, TriggersService } from "@services";
import { TriggerData } from "@type/models";
import { defaultTriggerSchema } from "@validations";

import { useFileOperations } from "@hooks";
import { useToastStore } from "@store";

import { Button, ErrorMessage, IconButton, Input, Loader } from "@components/atoms";
import { Select } from "@components/molecules";

import { InfoIcon, PlusCircle } from "@assets/image";
import { TrashIcon } from "@assets/image/icons";

export const DefaultTriggerForm = forwardRef<ChildFormRef, DefaultTriggerFormProps>(
	({ connectionId, isSaving, name, setIsSaving }, ref) => {
		const navigate = useNavigate();
		const { projectId } = useParams<{ projectId: string }>();
		const addToast = useToastStore((state) => state.addToast);
		const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
		const { t: tErrors } = useTranslation("errors");
		const { fetchResources } = useFileOperations(projectId!);
		const [triggerData, setTriggerData] = useState<TriggerData>({});
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
				data: triggerData,
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

		const updateTriggerDataKey = debounce((newKey, oldKey) => {
			if (newKey === oldKey) {
				return;
			}
			setTriggerData((prevData) => {
				const updatedTriggerData = { ...prevData };
				updatedTriggerData[newKey] = updatedTriggerData[oldKey];
				delete updatedTriggerData[oldKey];

				return updatedTriggerData;
			});
		}, 500);

		const updateTriggerDataValue = (key: string, value: string) => {
			setTriggerData((prevData) => ({
				...prevData,
				[key]: { string: { v: value } },
			}));
		};

		const handleAddNewData = () => {
			if (has(triggerData, "")) {
				addToast({
					id: Date.now().toString(),
					message: tErrors("emptyKeyExist"),
					type: "error",
				});

				return;
			}
			setTriggerData((prevData) => ({
				...prevData,
				"": { string: { v: "" } },
			}));
		};

		const handleDeleteData = (key: string) => {
			setTriggerData((prevData) => {
				const updatedData = { ...prevData };
				delete updatedData[key];

				return updatedData;
			});
		};

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
						placeholder={t("placeholders.functionName")}
						value={entryFunction}
					/>

					<ErrorMessage>{errors.entryFunction?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("eventType")}
						aria-label={t("placeholders.eventType")}
						isError={!!errors.eventType}
						placeholder={t("placeholders.eventType")}
						value={eventType}
					/>

					<ErrorMessage>{errors.eventType?.message}</ErrorMessage>
				</div>

				<div className="relative">
					<Input
						{...register("filter")}
						aria-label={t("placeholders.filter")}
						isError={!!errors.filter}
						placeholder={t("placeholders.filter")}
						value={filter}
					/>

					<ErrorMessage>{errors.filter?.message}</ErrorMessage>
				</div>

				<div>
					<div className="flex items-center gap-1 text-base text-gray-500">
						{t("titleData")}

						<div className="cursor-pointer" title={t("titleInfo")}>
							<InfoIcon className="fill-white" />
						</div>
					</div>

					<div className="mb-2 flex flex-col gap-2">
						{triggerData
							? Object.entries(triggerData).map(([key, value]) => (
									<div className="align-center flex gap-1" key={key}>
										<div className="flex w-full gap-6">
											<Input
												aria-label={t("placeholders.key")}
												className="w-full"
												defaultValue={key}
												onChange={(event) => updateTriggerDataKey(event.target.value, key)}
												placeholder={t("placeholders.key")}
											/>

											<Input
												aria-label={t("placeholders.value")}
												className="w-full"
												defaultValue={value.string.v}
												onChange={(event) => updateTriggerDataValue(key, event.target.value)}
												placeholder={t("placeholders.value")}
											/>
										</div>

										<IconButton
											ariaLabel={t("ariaDeleteData", { name: key })}
											className="self-center bg-gray-1300 hover:bg-black"
											onClick={() => handleDeleteData(key)}
										>
											<TrashIcon className="h-4 w-4 fill-white" />
										</IconButton>
									</div>
								))
							: null}
					</div>

					<Button
						className="group ml-auto w-auto gap-1 p-0 font-semibold text-gray-500 hover:text-white"
						onClick={handleAddNewData}
						type="button"
					>
						<PlusCircle className="h-5 w-5 stroke-gray-500 duration-300 group-hover:stroke-white" />

						{t("buttonAddNewData")}
					</Button>
				</div>
			</form>
		);
	}
);

DefaultTriggerForm.displayName = "DefaultTriggerForm";
