import React, { useEffect, useMemo, useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { eventTypesPerIntegration } from "@src/constants/triggers";
import { TriggerTypes } from "@src/enums";
import { PartialSelectOption, SelectOption } from "@src/interfaces/components";
import { useCacheStore, useOrgConnectionsStore } from "@src/store";
import { TriggerForm } from "@src/types/models";
import { stripAtlassianConnectionName, stripGoogleConnectionName } from "@src/utilities";

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";
import { SelectCreatable } from "@components/molecules/select";

export const TriggerSpecificFields = ({
	connectionId,
	filesNameList,
	buildFiles,
	selectedEventType,
}: {
	buildFiles?: Record<string, string[]>;
	connectionId: string;
	filesNameList: SelectOption[];
	selectedEventType?: PartialSelectOption;
}) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
		setValue,
	} = useFormContext<TriggerForm>();
	const connectionType = useWatch({ name: "connection.value" });
	const watchedFilePath = useWatch({ control, name: "filePath" });
	const watchedEntryFunction = useWatch({ control, name: "entryFunction" });
	const watchedFilter = useWatch({ control, name: "filter" });
	const watchedEventTypeSelect = useWatch({ control, name: "eventTypeSelect" });
	const { connections } = useCacheStore();
	const { orgConnections } = useOrgConnectionsStore();
	const [options, setOptions] = useState<SelectOption[]>([]);
	const [triggerRerender, setTriggerRerender] = useState(0);
	const [entryFunctionKey, setEntryFunctionKey] = useState(0);

	const isScheduleTrigger = connectionType === TriggerTypes.schedule;

	useEffect(() => {
		setValue("eventTypeSelect", undefined);
		setTriggerRerender((prev) => prev + 1);

		if (!connectionId || connectionId === TriggerTypes.webhook || connectionId === TriggerTypes.schedule) {
			setOptions([]);

			return;
		}

		const allConnections = [...(connections || []), ...orgConnections];
		const connectionIntegration = stripAtlassianConnectionName(
			stripGoogleConnectionName(
				allConnections
					.find((connection) => connection.connectionId === connectionId)
					?.integrationName?.toLowerCase() ?? ""
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
	}, [connectionId, orgConnections]);

	useEffect(() => {
		if (!watchedFilePath) {
			setValue("entryFunction", undefined);
			setEntryFunctionKey((prev) => prev + 1);
		}
	}, [watchedFilePath, setValue]);

	const entryFunctionOptions = useMemo(() => {
		if (!watchedFilePath?.value || !buildFiles) {
			return [];
		}
		const functions = buildFiles[watchedFilePath.value] || [];
		return functions.map((fn) => ({ label: fn, value: fn }));
	}, [watchedFilePath?.value, buildFiles]);

	const handleCreateEntryFunction = (inputValue: string) => {
		const newOption: SelectOption = {
			value: inputValue,
			label: inputValue,
		};
		setValue("entryFunction", newOption);
	};

	const handleCreateOption = (inputValue: string) => {
		const newOption: SelectOption = {
			value: inputValue,
			label: inputValue,
		};
		setOptions((prevOptions) => [...prevOptions, newOption]);
		setValue("eventTypeSelect", newOption);
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
							isClearable
							isError={!!errors.filePath}
							isRequired={isScheduleTrigger}
							label={t("placeholders.file")}
							noOptionsLabel={t("noFilesAvailable")}
							options={filesNameList}
							placeholder={t("placeholders.selectFile")}
							value={field.value as SelectOption | null}
						/>
					)}
				/>
				<ErrorMessage>{errors.filePath?.message as string}</ErrorMessage>
			</div>

			<div className="relative">
				<Controller
					control={control}
					name="entryFunction"
					render={({ field }) => (
						<SelectCreatable
							{...field}
							aria-label={t("placeholders.functionName")}
							createLabel={t("createFunctionNameLabel")}
							dataTestid="select-entry-function"
							isClearable
							isError={!!errors.entryFunction}
							isRequired={isScheduleTrigger}
							key={entryFunctionKey}
							label={t("placeholders.functionName")}
							noOptionsLabel={t("noFunctionsAvailable")}
							onCreateOption={handleCreateEntryFunction}
							options={entryFunctionOptions}
							placeholder={t("placeholders.selectFunction")}
							value={watchedEntryFunction as SelectOption | null}
						/>
					)}
				/>
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
									defaultValue={selectedEventType as SelectOption | null}
									isClearable
									isError={!!errors.eventTypeSelect}
									key={triggerRerender}
									label={t("placeholders.eventTypeLabel")}
									noOptionsLabel={t("placeholders.eventTypeSelect")}
									onCreateOption={handleCreateOption}
									options={options}
									placeholder={t("placeholders.eventTypeSelect")}
									value={watchedEventTypeSelect as SelectOption | null}
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
