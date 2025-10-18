import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { useCacheStore, useModalStore } from "@src/store";

import { IconButton, IconSvg } from "@components/atoms";
import { DropdownButton, InfoPopover, Accordion } from "@components/molecules";
import { InformationPopoverContent } from "@components/organisms/triggers/table/popoverContent";

import { MoreIcon } from "@assets/image";
import { EditIcon, EventsFlag, TrashIcon } from "@assets/image/icons";

export const ProjectConfigTriggers = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "triggers" });
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const triggers = useCacheStore((state) => state.triggers);

	const handleDeleteTrigger = useCallback(() => {
		openModal(ModalName.deleteTrigger);
	}, [openModal]);

	const handleEditTrigger = useCallback(
		(triggerId: string) => {
			navigate(`/projects/${projectId}/triggers/${triggerId}/edit`);
		},
		[projectId, navigate]
	);

	const handleShowEvents = useCallback(
		(triggerId: string) => {
			navigate(`/projects/${projectId}/triggers/${triggerId}/events`);
		},
		[projectId, navigate]
	);

	if (triggers.length === 0) {
		return null;
	}

	return (
		<Accordion hideDivider title={`${t("title")} (${triggers?.length || 0})`}>
			<div className="space-y-2">
				{triggers.map((trigger) => (
					<div
						className="group relative flex flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-2"
						key={trigger.triggerId}
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="truncate font-medium text-white">{trigger.name}</div>
							<div className="flex gap-4 text-xs text-gray-400">
								<span className="capitalize">{trigger.sourceType}</span>
								<span className="truncate">{trigger.entrypoint}</span>
							</div>
						</div>

						<DropdownButton
							ariaLabel={tTriggers("table.buttons.ariaModifyTrigger", { name: trigger.name })}
							contentMenu={
								<div className="flex flex-col gap-2">
									<InfoPopover>
										<InformationPopoverContent trigger={trigger} />
									</InfoPopover>
									<IconButton
										ariaLabel={tTriggers("table.buttons.ariaModifyTrigger", {
											name: trigger.name,
										})}
										className="h-8 w-full justify-start gap-2 px-4"
										onClick={() => handleEditTrigger(trigger.triggerId!)}
									>
										<EditIcon className="size-3 fill-white" />
										<span className="text-sm">{t("actions.edit")}</span>
									</IconButton>
									<IconButton
										ariaLabel={tTriggers("table.buttons.ariaDeleteTrigger", {
											name: trigger.name,
										})}
										className="h-8 w-full justify-start gap-2 px-4"
										onClick={() => handleDeleteTrigger()}
									>
										<TrashIcon className="size-4 stroke-white" />
										<span className="text-sm">{t("actions.delete")}</span>
									</IconButton>
									<IconButton
										ariaLabel={tTriggers("table.buttons.ariaShowTriggerEvents", {
											name: trigger.name,
										})}
										className="h-8 w-full justify-start gap-2 px-4"
										onClick={() => handleShowEvents(trigger.triggerId!)}
									>
										<EventsFlag className="size-4 stroke-white" />
										<span className="text-sm">{t("actions.showEvents")}</span>
									</IconButton>
								</div>
							}
						>
							<IconButton ariaLabel={t("actions.more")} className="size-8">
								<IconSvg
									className="fill-white transition group-hover:fill-green-200 group-active:fill-green-800"
									size="md"
									src={MoreIcon}
								/>
							</IconButton>
						</DropdownButton>
					</div>
				))}
			</div>
		</Accordion>
	);
};
