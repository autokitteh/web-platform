import React, { useEffect, useMemo, useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { eventTypesPerIntegration } from "@src/constants/triggers";
import { TriggerTypes } from "@src/enums";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore, useManualRunStore } from "@src/store";
import { stripAtlassianConnectionName, stripGoogleConnectionName } from "@src/utilities";
import { TriggerFormData } from "@validations";

import { ErrorMessage, IconSvg, Input } from "@components/atoms";
import { Select } from "@components/molecules";
import { SelectCreatable } from "@components/molecules/select";

import { WarningTriangleIcon } from "@assets/image/icons";

export const TriggerSpecificFields = ({
	connectionId,
	filesNameList,
	selectedEventType,
}: {
	connectionId: string;
	filesNameList: SelectOption[];
	selectedEventType?: SelectOption;
}) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
		setValue,
	} = useFormContext<TriggerFormData>();
	const { projectId } = useParams();
	const connectionType = useWatch({ name: "connection.value" });
	const watchedFilePath = useWatch({ control, name: "filePath" });
	const watchedFunctionName = useWatch({ control, name: "entryFunction" });
	const watchedFilter = useWatch({ control, name: "filter" });
	const watchedEventTypeSelect = useWatch({ control, name: "eventTypeSelect" });
	const { connections } = useCacheStore();

	const { projectManualRun } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
	}));
	const { files, activeDeployment } = projectManualRun || {};

	const [options, setOptions] = useState<SelectOption[]>([]);
	const [triggerRerender, setTriggerRerender] = useState(0);
	const [fileFunctions, setFileFunctions] = useState<SelectOption[]>([]);
	const [functionWarning, setFunctionWarning] = useState<string | null>(null);

	useEffect(() => {
		if (!watchedFilePath?.value || !files) {
			setFileFunctions([]);
			return;
		}

		const functions =
			files[watchedFilePath.value]?.map((fileFunction) => ({
				label: fileFunction,
				value: fileFunction,
			})) || [];

		setFileFunctions(functions);
	}, [watchedFilePath?.value, files]);

	useEffect(() => {
		if (!activeDeployment && !watchedFunctionName) return;

		const matchingFunction = fileFunctions.find((func) => func.value === watchedFunctionName);
		if (matchingFunction) {
			setValue("entryFunction", matchingFunction.value);
			return;
		}

		if (watchedFunctionName && fileFunctions.length > 0) {
			setFunctionWarning(t("functionIsNotAvailable", { functionName: watchedFunctionName }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeDeployment, fileFunctions, watchedFunctionName]);

	useEffect(() => {
		setValue("eventTypeSelect", undefined);
		setTriggerRerender((prev) => prev + 1);

		if (!connectionId || connectionId === TriggerTypes.webhook || connectionId === TriggerTypes.schedule) {
			setOptions([]);
			return;
		}

		const connectionIntegration = stripAtlassianConnectionName(
			stripGoogleConnectionName(
				connections
					?.find((connection) => connection.connectionId === connectionId)
					?.integrationName?.toLowerCase() || ""
			)
		);

		if (
			!connectionIntegration ||
			!eventTypesPerIntegration[connectionIntegration as keyof typeof eventTypesPerIntegration]
		) {
			setOptions([]);
			return;
		}

		const eventTypes = eventTypesPerIntegration[connectionIntegration as keyof typeof eventTypesPerIntegration].map(
			(eventType) => ({
				value: eventType,
				label: eventType,
			})
		);

		setOptions(eventTypes);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connectionId, connections]);

	const handleCreateOption = (inputValue: string) => {
		const newOption: SelectOption = {
			value: inputValue,
			label: inputValue,
		};
		setOptions((prevOptions) => [...prevOptions, newOption]);
		setValue("eventTypeSelect", newOption);
	};

	const defaultSelectFunctionValue = useMemo(() => {
		if (!watchedFilePath?.value || !watchedFunctionName) return null;
		return fileFunctions.find((fileFunction) => fileFunction.value === watchedFunctionName) || null;
	}, [fileFunctions, watchedFilePath?.value, watchedFunctionName]);

	const commonProps = {
		"aria-label": t("placeholders.functionName"),
		isError: !!errors.entryFunction,
		label: t("placeholders.functionName"),
	};

	const shouldUseSelect = useMemo(
		() => activeDeployment || fileFunctions.length > 0,
		[activeDeployment, fileFunctions.length]
	);

	const handleFilePathChange = (selected: SelectOption) => {
		setValue("filePath", selected);

		if (files && selected.value && files[selected.value]?.length > 0) {
			const firstFunction = files[selected.value][0];
			setValue("entryFunction", firstFunction);
			setFunctionWarning(null);

			return;
		}

		setValue("entryFunction", "");
	};

	const handleFunctionChange = (selected: SelectOption | null) => {
		setValue("entryFunction", selected?.value);
		setFunctionWarning(null);
	};

	return (
		<>
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
							onChange={(selected) => handleFilePathChange(selected as SelectOption)}
							options={filesNameList}
							placeholder={t("placeholders.selectFile")}
						/>
					)}
				/>
				<ErrorMessage>{errors.filePath?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				{shouldUseSelect ? (
					<Controller
						control={control}
						name="entryFunction"
						render={({ field }) => (
							<>
								<Select
									{...field}
									{...commonProps}
									defaultValue={defaultSelectFunctionValue}
									noOptionsLabel={t("noFilesAvailable")}
									onChange={(selected) => handleFunctionChange(selected as SelectOption)}
									options={fileFunctions}
									placeholder={t("placeholders.selectEntrypoint")}
									value={defaultSelectFunctionValue}
								/>
								{functionWarning ? (
									<div className="ml-4 flex items-center gap-3">
										<IconSvg src={WarningTriangleIcon} />
										<div className="mt-1 text-sm text-yellow-500">{functionWarning}</div>
									</div>
								) : null}
							</>
						)}
					/>
				) : (
					<Input {...commonProps} isRequired {...register("entryFunction")} value={watchedFunctionName} />
				)}
				<ErrorMessage>{errors.entryFunction?.message as string}</ErrorMessage>
			</div>

			{connectionType !== TriggerTypes.webhook && connectionType !== TriggerTypes.schedule ? (
				<>
					<div className="relative">
						<Controller
							control={control}
							name="eventTypeSelect"
							render={({ field }) => (
								<SelectCreatable
									{...field}
									aria-label={t("placeholders.eventTypeLabel")}
									createLabel={t("createFunctionNameLabel")}
									dataTestid="select-trigger-event-type"
									defaultValue={selectedEventType}
									isError={!!errors.eventTypeSelect}
									key={triggerRerender}
									label={t("placeholders.eventTypeLabel")}
									noOptionsLabel={t("placeholders.eventTypeSelect")}
									onCreateOption={handleCreateOption}
									options={options}
									placeholder={t("placeholders.eventTypeSelect")}
									value={watchedEventTypeSelect}
								/>
							)}
						/>
						<ErrorMessage>{errors.eventTypeSelect?.message as string}</ErrorMessage>
					</div>

					<div className="relative">
						<Input
							aria-label={t("placeholders.filter")}
							{...register("filter")}
							isError={!!errors.filter}
							label={t("placeholders.filter")}
							value={watchedFilter}
						/>
						<ErrorMessage>{errors.filter?.message as string}</ErrorMessage>
					</div>
				</>
			) : null}
		</>
	);
};
