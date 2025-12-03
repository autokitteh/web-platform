import React, { useEffect, useMemo } from "react";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { extraTriggerTypes } from "@src/constants";
import { ConnectionStatus } from "@src/enums";
import { SelectGroup } from "@src/interfaces/components";
import { useCacheStore, useGlobalConnectionsStore, useOrganizationStore } from "@src/store";
import { Connection, TriggerForm } from "@src/types/models";

import { ErrorMessage, Input } from "@components/atoms";
import { GroupedSelect } from "@components/molecules";

import { LinkIcon, MyOrganizationsIcon, RocketIcon } from "@assets/image/icons";

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

	const watchedName = useWatch({ control, name: "name" });
	const watchedConnection = useWatch({ control, name: "connection" });

	useEffect(() => {
		if (currentOrganization?.id && globalConnections.length === 0) {
			fetchGlobalConnections(currentOrganization.id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentOrganization?.id]);

	const getConnectionStatus = (
		status: string,
		statusInfoMessage: string
	): { status: ConnectionStatus; statusInfoMessage?: string } => {
		const statusValue = ConnectionStatus[status as keyof typeof ConnectionStatus];
		if (statusValue === ConnectionStatus.ok) return { status: ConnectionStatus.ok };
		if (statusValue === ConnectionStatus.warning) return { status: ConnectionStatus.warning, statusInfoMessage };

		return { status: ConnectionStatus.error, statusInfoMessage };
	};

	const connectionGroups = useMemo((): SelectGroup[] => {
		const baseTriggerTypeOptions = [...extraTriggerTypes];

		const projectConnectionOptions =
			connections?.map((item: Connection) => ({
				label: item.name,
				value: item.connectionId,
				icon: item.logo,
				connectionStatus: getConnectionStatus(item.status, item.statusInfoMessage),
			})) || [];

		const organizationConnectionOptions = globalConnections.map((item: Connection) => ({
			label: item.name,
			value: item.connectionId,
			icon: item.logo,
			isHighlighted: true,
			highlightLabel: "Global",
			connectionStatus: getConnectionStatus(item.status, item.statusInfoMessage),
		}));

		const groups: SelectGroup[] = [
			{
				label: t("connectionGroups.baseTriggerTypes"),
				options: baseTriggerTypeOptions,
				icon: RocketIcon,
				iconClassName: "fill-white",
			},
		];

		if (projectConnectionOptions.length > 0) {
			groups.push({
				label: t("connectionGroups.projectConnections"),
				options: projectConnectionOptions,
				icon: LinkIcon,
				iconClassName: "fill-white",
			});
		}

		if (organizationConnectionOptions.length > 0) {
			groups.push({
				label: t("connectionGroups.organizationConnections"),
				options: organizationConnectionOptions,
				icon: MyOrganizationsIcon,
				iconClassName: "stroke-white stroke-1.5",
			});
		}

		return groups;
	}, [connections, globalConnections, t]);

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
							aria-label={t("placeholders.selectConnection")}
							dataTestid="select-trigger-type"
							disabled={isEdit}
							groups={connectionGroups}
							isError={!!errors.connection}
							isRequired
							label={t("placeholders.connection")}
							noOptionsLabel={t("noConnectionsAvailable")}
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
