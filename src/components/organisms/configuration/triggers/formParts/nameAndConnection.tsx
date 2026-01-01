import React, { useEffect, useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { buildConnectionGroups } from "@src/constants/triggers.constants";
import { SelectGroup } from "@src/interfaces/components";
import { useCacheStore, useOrgConnectionsStore } from "@src/store";
import { TriggerForm } from "@src/types/models";

import { ErrorMessage, Input } from "@components/atoms";
import { GroupedSelect } from "@components/molecules";

export const NameAndConnectionFields = ({ isEdit }: { isEdit?: boolean }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerForm>();
	const connections = useCacheStore((state) => state.connections);
	const orgConnections = useOrgConnectionsStore((state) => state.orgConnections);

	const watchedName = useWatch({ control, name: "name" });
	const watchedType = useWatch({ control, name: "connection" });

	const [ariaLabel, setAriaLabel] = useState("Select trigger type");
	const [connectionGroups, setConnectionGroups] = useState<SelectGroup[]>([]);

	useEffect(() => {
		if (!watchedType || !watchedType.label || watchedType.label === "") {
			setAriaLabel("Select trigger type: no type selected");
			return;
		}
		const ariaLabelofTypeSelect = `Selected type: ${watchedType.label}`;
		setAriaLabel(ariaLabelofTypeSelect);
	}, [watchedType]);

	useEffect(() => {
		const groups = buildConnectionGroups(connections || [], orgConnections, t);
		setConnectionGroups(groups);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connections, orgConnections]);

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
						<GroupedSelect
							{...field}
							aria-label={ariaLabel}
							dataTestid="select-trigger-type"
							disabled={isEdit}
							groups={connectionGroups}
							isError={!!errors.connection}
							isRequired
							label={t("placeholders.connection")}
							noOptionsLabel={t("noConnectionsAvailable")}
							placeholder={t("placeholders.selectTriggerType")}
							value={watchedType}
						/>
					)}
				/>

				<ErrorMessage>{errors.connection?.message as string}</ErrorMessage>
			</div>
		</>
	);
};
