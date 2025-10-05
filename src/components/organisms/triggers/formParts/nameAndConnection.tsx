import React, { useMemo } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { extraTriggerTypes } from "@src/constants";
import { useCacheStore } from "@src/store";
import { TriggerFormData } from "@src/types";

import { ErrorMessage, Input } from "@components/atoms";
import { Select } from "@components/molecules";

export const NameAndConnectionFields = ({ isEdit }: { isEdit?: boolean }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerFormData>();
	const { connections } = useCacheStore();

	const watchedName = useWatch({ control, name: "name" });
	const watchedConnection = useWatch({ control, name: "connection" });
	const formattedConnections = useMemo(
		() => [
			...extraTriggerTypes,
			...(connections?.map((item) => ({
				label: item.name,
				value: item.connectionId,
			})) || []),
		],
		[connections]
	);

	return (
		<>
			<div className="relative">
				<Input
					aria-label={t("placeholders.name")}
					{...register("name")}
					disabled={isEdit}
					isError={!!errors.name}
					isRequired
					label={t("placeholders.name")}
					value={watchedName}
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
							dataTestid="select-trigger-type"
							disabled={isEdit}
							isError={!!errors.connection}
							isRequired
							label={t("placeholders.connection")}
							noOptionsLabel={t("noConnectionsAvailable")}
							options={formattedConnections}
							placeholder={t("placeholders.selectConnection")}
							value={watchedConnection}
						/>
					)}
				/>

				<ErrorMessage>{errors.connection?.message as string}</ErrorMessage>
			</div>
		</>
	);
};
