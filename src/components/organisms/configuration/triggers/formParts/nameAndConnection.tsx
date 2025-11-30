import React, { useCallback, useMemo, useState } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { extraTriggerTypes } from "@src/constants";
import { EventListenerName, TriggerTypes } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useGlobalConnectionsStore, useOrganizationStore } from "@src/store";
import { Connection, TriggerForm } from "@src/types/models";

import { Checkbox, ErrorMessage, IconButton, Input } from "@components/atoms";
import { Select } from "@components/molecules";

import { SettingsIcon } from "@assets/image/icons";

export const NameAndConnectionFields = ({ isEdit }: { isEdit?: boolean }) => {
	const { t } = useTranslation("tabs", { keyPrefix: "triggers.form" });
	const {
		control,
		formState: { errors },
		register,
	} = useFormContext<TriggerForm>();
	const { connections } = useCacheStore();
	const { globalConnections, fetchGlobalConnections } = useGlobalConnectionsStore();
	const { currentOrganization } = useOrganizationStore();

	const [showGlobalConnections, setShowGlobalConnections] = useState(false);

	const watchedName = useWatch({ control, name: "name" });
	const watchedConnection = useWatch({ control, name: "connection" });
	const connectionType = watchedConnection?.value;

	const isConnectionType =
		connectionType &&
		!Object.values(TriggerTypes).includes(connectionType as TriggerTypes) &&
		connectionType !== TriggerTypes.schedule &&
		connectionType !== TriggerTypes.webhook;

	const handleShowGlobalConnectionsChange = useCallback(
		async (checked: boolean) => {
			setShowGlobalConnections(checked);
			if (checked && currentOrganization?.id && globalConnections.length === 0) {
				await fetchGlobalConnections(currentOrganization.id);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[currentOrganization?.id, globalConnections.length]
	);

	const formattedConnections = useMemo(() => {
		const baseConnections = [
			...extraTriggerTypes,
			...(connections?.map((item: Connection) => ({
				label: item.name,
				value: item.connectionId,
				icon: item.logo,
			})) || []),
		];

		if (showGlobalConnections && globalConnections?.length) {
			const globalConnectionOptions = globalConnections.map((item: Connection) => ({
				label: item.name,
				value: item.connectionId,
				icon: item.logo,
				isHighlighted: true,
				highlightLabel: "Global",
			}));

			return [...baseConnections, ...globalConnectionOptions];
		}

		return baseConnections;
	}, [connections, showGlobalConnections, globalConnections]);

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

			{isConnectionType || !connectionType ? (
				<div className="flex items-center gap-2">
					<Checkbox
						checked={showGlobalConnections}
						className="h-6"
						isLoading={false}
						label={t("showGlobalConnections")}
						onChange={handleShowGlobalConnectionsChange}
					/>
					{showGlobalConnections ? (
						<IconButton
							ariaLabel={t("manageGlobalConnections")}
							className="h-6"
							onClick={(evt) => {
								triggerEvent(EventListenerName.displayGlobalConnectionsDrawer);
								evt.stopPropagation();
							}}
							title={t("manageGlobalConnections")}
						>
							<SettingsIcon className="size-4 fill-white transition hover:fill-green-800" />
						</IconButton>
					) : null}
				</div>
			) : null}
		</>
	);
};
