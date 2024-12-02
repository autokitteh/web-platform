import React, { useEffect, useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { eventTypesPerIntegration } from "@src/constants/triggers";
import { TriggerTypes } from "@src/enums";
import { SelectOption } from "@src/interfaces/components";
import { useCacheStore } from "@src/store";
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
	const connectionType = useWatch({ name: "connection.value" });
	const watchedFunctionName = useWatch({ control, name: "entryFunction" });
	const watchedFilter = useWatch({ control, name: "filter" });
	const watchedEventTypeSelect = useWatch({ control, name: "eventTypeSelect" });
	const { connections } = useCacheStore();
	const [options, setOptions] = useState<SelectOption[]>([]);
	const [triggerRerender, setTriggerRerender] = useState(0);

	useEffect(() => {}, []);

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
	}, [connectionId]);

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
				<Input
					aria-label={t("placeholders.functionName")}
					{...register("entryFunction")}
					isError={!!errors.entryFunction}
					label={t("placeholders.functionName")}
					value={watchedFunctionName}
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
									dataTestid="select-trigger-event-type"
									defaultValue={selectedEventType}
									isError={!!errors.eventTypeSelect}
									key={triggerRerender}
									label={t("placeholders.eventTypeLabel")}
									noOptionsLabel={t("placeholders.eventTypesSelect")}
									onCreateOption={handleCreateOption}
									options={options}
									placeholder={t("placeholders.eventTypesSelect")}
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
