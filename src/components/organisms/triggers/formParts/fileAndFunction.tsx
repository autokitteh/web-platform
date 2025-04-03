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

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";
import { SelectCreatable } from "@components/molecules/select";

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
	const watchedFunctionName = useWatch({ control, name: "entryFunction" });
	const watchedFilter = useWatch({ control, name: "filter" });
	const watchedEventTypeSelect = useWatch({ control, name: "eventTypeSelect" });
	const { connections } = useCacheStore();
	const [options, setOptions] = useState<SelectOption[]>([]);
	const [triggerRerender, setTriggerRerender] = useState(0);
	const { projectManualRun } = useManualRunStore((state) => ({
		projectManualRun: state.projectManualRun[projectId!],
	}));

	const { filePath, files } = projectManualRun || {};

	const fileFunctions = useMemo(() => {
		if (!filePath?.value || !files) return [];
		return (
			files[filePath.value]?.map((fileFunction) => ({
				label: fileFunction,
				value: fileFunction,
			})) || []
		);
	}, [filePath?.value, files]);

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
	}, [connectionId]);

	const handleCreateOption = (inputValue: string) => {
		const newOption: SelectOption = {
			value: inputValue,
			label: inputValue,
		};
		setOptions((prevOptions) => [...prevOptions, newOption]);
		setValue("eventTypeSelect", newOption);
	};

	const defaultSelectFunctionValue = useMemo(() => {
		if (!filePath?.value || !watchedFunctionName) return null;
		return fileFunctions.find((fileFunction) => fileFunction.value === watchedFunctionName) || null;
	}, [fileFunctions, filePath?.value, watchedFunctionName]);

	const commonProps = {
		"aria-label": t("placeholders.functionName"),
		isError: !!errors.entryFunction,
		label: t("placeholders.functionName"),
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
							options={filesNameList}
							placeholder={t("placeholders.selectFile")}
						/>
					)}
				/>
				<ErrorMessage>{errors.filePath?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				{fileFunctions.length > 0 ? (
					<Controller
						control={control}
						name="entryFunction"
						render={({ field }) => (
							<Select
								{...field}
								{...commonProps}
								defaultValue={defaultSelectFunctionValue}
								noOptionsLabel={t("noFilesAvailable")}
								onChange={(selected) => setValue("entryFunction", selected?.value)}
								options={fileFunctions}
								placeholder={t("placeholders.selectEntrypoint")}
							/>
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
