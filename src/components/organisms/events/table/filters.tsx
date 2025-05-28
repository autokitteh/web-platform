import React, { useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import { SingleValue } from "react-select";

import { defaultPopoverSelect, eventSourseTypes } from "@constants";
import { ConnectionService, IntegrationsService, TriggersService } from "@services";
import { SourceType } from "@src/enums";
import { SelectOption } from "@src/interfaces/components";
import { useToastStore } from "@src/store";
import { Connection, Integration, Trigger } from "@src/types/models";

import { RefreshButton } from "@components/molecules";
import { PopoverSelect } from "@components/molecules/popoverSelect/select";

interface EventFiltersProps {
	projectOptions: SelectOption[];
	onProjectChange: (projectId: string) => void;
	onSourceNameChange: (projectId: string, sourceId: string, integrationId: string) => void;
	onIntegrationChange: (projectId: string, sourceId: string, integrationId: string) => void;
	onRefresh: (projectId: string, sourceId: string, integrationId: string) => Promise<void>;
	isLoading: boolean;
}

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
	const [selectedSourceType, setSelectedSourceType] = useState<string>();
	const [selectedProject, setSelectedProject] = useState<SingleValue<SelectOption>>();
	const [selectedIntegration, setSelectedIntegration] = useState<string>();
	const [selectedSourceId, setSelectedSourceId] = useState<string>();

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
	}, []);

	useEffect(() => {
		fetchIntegrations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSourceOptions = useCallback(
		async (sourceType: string) => {
			if (!selectedProject?.value) return;

			const service = sourceType === SourceType.connections ? ConnectionService : TriggersService;
			const { data, error } = await service.list(selectedProject.value);

			if (error) {
				addToast({
					message: t(`${sourceType}NotFound`),
					type: "error",
				});
				return;
			}

			setSourceOptions(
				(data || []).map((item: Connection | Trigger) => ({
					label: item.name || "",
					value:
						sourceType === SourceType.connections
							? (item as Connection).connectionId || ""
							: (item as Trigger).triggerId || "",
				}))
			);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedProject?.value, selectedSourceType]
	);

	const handleProjectChange = useCallback(
		(id: string) => {
			const project = projectOptions.find((option) => option.value === id);
			setSelectedProject(project);
			if (project?.value) {
				onProjectChange(project.value);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectOptions]
	);

	const handleIntegrationChange = useCallback(
		(id: string) => {
			setSelectedIntegration(id);
			if (selectedProject?.value) {
				onIntegrationChange(selectedProject.value, selectedSourceId || "", id);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedProject?.value]
	);

	const handleSourceTypeChange = useCallback(
		(id: string) => {
			setSelectedSourceType(id);
			if (id) {
				fetchSourceOptions(id);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	const handleSourceNameChange = useCallback(
		(id: string) => {
			setSelectedSourceId(id);
			if (id && selectedProject?.value) {
				onSourceNameChange(selectedProject.value, id, selectedIntegration || "");
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[selectedProject?.value]
	);
	const handleRefresh = useCallback(async () => {
		if (!selectedProject?.value) return;
		await onRefresh(selectedProject.value, selectedSourceId || "", selectedIntegration || "");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProject?.value, selectedSourceId, selectedIntegration]);

	return (
		<div className="flex justify-between gap-4">
			<div className="flex w-full gap-4">
				<div className="w-full max-w-64">
					<PopoverSelect
						defaultSelectedItem={defaultPopoverSelect}
						items={projectOptions.map((option) => ({
							id: option.value,
							label: option.label,
						}))}
						label={t("selects.projectName")}
						onItemSelected={handleProjectChange}
					/>
				</div>
				<div className="w-full max-w-64">
					<PopoverSelect
						defaultSelectedItem={defaultPopoverSelect}
						items={integrations.map((integration) => ({
							id: integration.integrationId,
							label: integration.displayName,
							icon: integration.icon,
						}))}
						label={t("selects.integration")}
						onItemSelected={handleIntegrationChange}
					/>
				</div>
				<div>
					{selectedProject && selectedProject.value ? (
						<div className="w-64">
							<PopoverSelect
								defaultSelectedItem={defaultPopoverSelect}
								items={eventSourseTypes.map((type) => ({
									id: type.label,
									label: type.label,
								}))}
								label={t("selects.sourceType")}
								onItemSelected={handleSourceTypeChange}
							/>
						</div>
					) : null}
					{selectedSourceType && selectedSourceType !== defaultPopoverSelect ? (
						<div className="mt-2 w-64">
							<PopoverSelect
								defaultSelectedItem={defaultPopoverSelect}
								items={sourceOptions.map((source) => ({
									id: source.value,
									label: source.label,
								}))}
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
