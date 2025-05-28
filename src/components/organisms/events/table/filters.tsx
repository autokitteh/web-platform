import React, { useCallback, useEffect, useState, useMemo } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { defaultPopoverSelect } from "@constants";
import { IntegrationsService } from "@services";
import { SelectOption, EventFiltersProps } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { Integration } from "@src/types/models";

import { RefreshButton } from "@components/molecules";
import { PopoverSelect } from "@components/molecules/popoverSelect/select";

export const EventFilters = ({
	projectOptions,
	onProjectChange,
	onIntegrationChange,
	onRefresh,
	isLoading,
}: EventFiltersProps) => {
	const { t } = useTranslation("events");
	const addToast = useToastStore((state) => state.addToast);
	const [integrations, setIntegrations] = useState<Integration[]>([]);
	const [filters, setFilters] = useState<{
		integration?: string;
		project: SingleValue<SelectOption>;
	}>({
		project: null,
		integration: undefined,
	});

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

	const handleProjectChange = useCallback(
		(id?: string) => {
			const project = id ? projectOptions.find((option) => option.value === id) : null;
			updateFilters({
				project,
				integration: undefined,
			});
			onProjectChange(project?.value || "");
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectOptions]
	);

	const handleIntegrationChange = useCallback(
		(id?: string) => {
			const integration = id ? integrations.find((option) => option.integrationId === id) : null;
			updateFilters({ integration: integration?.integrationId });
			onIntegrationChange(filters.project?.value || "", integration?.integrationId || "");
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filters.project?.value]
	);

	const handleRefresh = useCallback(async () => {
		if (!filters.project?.value) return;
		await onRefresh(filters.project.value, filters.integration || "");
	}, [filters.project?.value, filters.integration, onRefresh]);

	return (
		<div className="flex justify-between gap-4">
			<div className="w-2/3">
				<div className="grid w-full grid-cols-auto-fit-125 gap-3">
					<PopoverSelect
						defaultSelectedItem={defaultPopoverSelect}
						items={projectOptionsList}
						label={t("selects.projectName")}
						onItemSelected={handleProjectChange}
					/>
					<PopoverSelect
						defaultSelectedItem={defaultPopoverSelect}
						items={integrationOptionsList}
						label={t("selects.integration")}
						onItemSelected={handleIntegrationChange}
					/>
				</div>
			</div>
			<div className="mt-5">
				<RefreshButton isLoading={isLoading} onRefresh={handleRefresh} />
			</div>
		</div>
	);
};
