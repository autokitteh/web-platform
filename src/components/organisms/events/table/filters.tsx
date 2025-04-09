import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { defaultPopoverSelect, eventSourseTypes } from "@constants";
import { ConnectionService, IntegrationsService, TriggersService } from "@services";
import { SourceType } from "@src/enums";
import { SelectOption, EventFiltersProps, BasePopoverSelectRef } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { Connection, Integration, Trigger } from "@src/types/models";

import { RefreshButton } from "@components/molecules";
import { PopoverSelect } from "@components/molecules/popoverSelect/select";

export const EventFilters = ({
	projectOptions,
	onProjectChange,
	onSourceNameChange,
	onIntegrationChange,
	onRefresh,
	isLoading,
}: EventFiltersProps) => {
	const { t } = useTranslation("events");
	const addToast = useToastStore((state) => state.addToast);
	const [sourceOptions, setSourceOptions] = useState<SelectOption[]>([]);
	const [integrations, setIntegrations] = useState<Integration[]>([]);
	const [filters, setFilters] = useState<{
		integration?: string;
		project: SingleValue<SelectOption>;
		sourceId?: string;
		sourceType?: string;
	}>({
		project: null,
		integration: undefined,
		sourceType: undefined,
		sourceId: undefined,
	});

	const sourceTypeSelectRef = useRef<BasePopoverSelectRef>(null);

	const projectOptionsList = useMemo(
		() =>
			projectOptions.map((option) => ({
				id: option.value,
				label: option.label,
			})),
		[projectOptions]
	);

	const integrationOptionsList = useMemo(
		() =>
			integrations.map((integration) => ({
				id: integration.integrationId,
				label: integration.displayName,
				icon: integration.icon,
			})),
		[integrations]
	);

	const sourceTypeOptionsList = useMemo(
		() =>
			eventSourseTypes.map((type) => ({
				id: type.label,
				label: type.label,
			})),
		[]
	);

	const sourceNameOptionsList = useMemo(
		() =>
			sourceOptions.map((source) => ({
				id: source.value,
				label: source.label,
			})),
		[sourceOptions]
	);

	const updateFilters = useCallback((updates: Partial<typeof filters>) => {
		setFilters((prev) => ({ ...prev, ...updates }));
	}, []);

	const fetchIntegrations = useCallback(async () => {
		const { data: integrations, error } = await IntegrationsService.list();

		if (error) {
			addToast({
				message: t("intergrationsNotFound"),
				type: "error",
			});
			return;
		}

		setIntegrations(integrations || []);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		fetchIntegrations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSourceOptions = useCallback(
		async (sourceType: string) => {
			if (!filters.project?.value || !sourceType) {
				return;
			}

			try {
				const service = sourceType === SourceType.connections ? ConnectionService : TriggersService;
				const { data, error } = await service.list(filters.project.value);

				if (error || !data) {
					throw new Error(t("errorFetchingSources"));
				}

				const options = data.map((item: Connection | Trigger) => ({
					label: item.name || "",
					value:
						sourceType === SourceType.connections
							? item.connectionId || ""
							: (item as Trigger).triggerId || "",
				}));

				setSourceOptions(options);
			} catch (error) {
				addToast({
					message: error.message,
					type: "error",
				});
				setSourceOptions([]);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filters.project]
	);

	const handleProjectChange = useCallback(
		(id?: string) => {
			const project = id ? projectOptions.find((option) => option.value === id) : null;
			updateFilters({
				project,
				sourceType: undefined,
				sourceId: undefined,
				integration: undefined,
			});
			onProjectChange(project?.value || "");

			sourceTypeSelectRef.current?.reset();
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectOptions]
	);

	const handleIntegrationChange = useCallback(
		(id?: string) => {
			updateFilters({ integration: id });
			if (filters.project?.value) {
				onIntegrationChange(filters.project.value, filters.sourceId || "", id || "");
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filters.project?.value, filters.sourceId]
	);

	const handleSourceTypeChange = useCallback(
		(id?: string) => {
			if (id && filters.project?.value) {
				updateFilters({ sourceType: id, sourceId: undefined });
				fetchSourceOptions(id);

				return;
			}

			updateFilters({ sourceType: undefined, sourceId: undefined });
			setSourceOptions([]);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filters.project?.value]
	);

	const handleSourceNameChange = useCallback(
		(id?: string) => {
			updateFilters({ sourceId: id });
			if (filters.project?.value) {
				onSourceNameChange(filters.project.value, id || "", filters.integration || "");
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filters.project?.value, filters.integration]
	);

	const handleRefresh = useCallback(async () => {
		if (!filters.project?.value) return;
		await onRefresh(filters.project.value, filters.sourceId || "", filters.integration || "");
	}, [filters.project?.value, filters.sourceId, filters.integration, onRefresh]);

	return (
		<div className="flex justify-between gap-4">
			<div className="flex w-full gap-4">
				<div className="w-full max-w-64">
					<PopoverSelect
						defaultSelectedItem={defaultPopoverSelect}
						items={projectOptionsList}
						label={t("selects.projectName")}
						onItemSelected={handleProjectChange}
					/>
				</div>
				<div className="w-full max-w-64">
					<PopoverSelect
						defaultSelectedItem={defaultPopoverSelect}
						items={integrationOptionsList}
						label={t("selects.integration")}
						onItemSelected={handleIntegrationChange}
					/>
				</div>
				<div className="w-full max-w-64">
					{filters.project?.value ? (
						<PopoverSelect
							defaultSelectedItem={defaultPopoverSelect}
							items={sourceTypeOptionsList}
							label={t("selects.sourceType")}
							onItemSelected={handleSourceTypeChange}
							ref={sourceTypeSelectRef}
						/>
					) : null}
					{filters.sourceType ? (
						<div className="mt-2">
							<PopoverSelect
								defaultSelectedItem={defaultPopoverSelect}
								items={sourceNameOptionsList}
								label={t("selects.sourceName")}
								onItemSelected={handleSourceNameChange}
							/>
						</div>
					) : null}
				</div>
			</div>
			<div className="mt-5">
				<RefreshButton isLoading={isLoading} onRefresh={handleRefresh} />
			</div>
		</div>
	);
};
