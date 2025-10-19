import React, { useCallback } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { ModalName } from "@enums/components";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useCacheStore, useModalStore, useSharedBetweenProjectsStore } from "@src/store";

import { Button, IconButton, IconSvg } from "@components/atoms";
import { Accordion, DropdownButton } from "@components/molecules";

import { MoreIcon } from "@assets/image";
import { CirclePlusIcon, EditIcon, EventsFlag, TrashIcon, TriggerBoltIcon } from "@assets/image/icons";

export const ProjectConfigTriggers = () => {
	const { t } = useTranslation("project-configuration-view", { keyPrefix: "triggers" });
	const { t: tTriggers } = useTranslation("tabs", { keyPrefix: "triggers" });
	const { projectId } = useParams();
	const navigate = useNavigate();
	const { openModal } = useModalStore();
	const { setShouldReopenProjectConfigAfterEvents } = useSharedBetweenProjectsStore();
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
			if (!projectId) return;

			setShouldReopenProjectConfigAfterEvents(projectId, true);
			triggerEvent(EventListenerName.hideProjectConfigSidebar);
			navigate(`/projects/${projectId}/triggers/${triggerId}/events`);
		},

		// eslint-disable-next-line react-hooks/exhaustive-deps
		[projectId]
	);

	if (triggers.length === 0) {
		return null;
	}

	return (
		<Accordion
			closeIcon={TriggerBoltIcon}
			hideDivider
			openIcon={TriggerBoltIcon}
			title={`${t("title")} (${triggers?.length || 0})`}
		>
			<div className="space-y-2">
				{triggers.map((trigger) => (
					<div
						className="group relative flex flex-row items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 p-2"
						key={trigger.triggerId}
					>
						<div className="min-w-0 flex-1 space-y-1">
							<div className="truncate font-medium text-white">{trigger.name}</div>
							<div className="flex gap-4 text-xs text-gray-400">
								<span className="truncate">{trigger.entrypoint}</span>
							</div>
						</div>

						<DropdownButton
							ariaLabel={tTriggers("table.buttons.ariaModifyTrigger", { name: trigger.name })}
							contentMenu={
								<div className="flex flex-col gap-1">
									<button
										aria-label={tTriggers("table.buttons.ariaModifyTrigger", {
											name: trigger.name,
										})}
										className="ml-0.5 flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
										onClick={() => handleEditTrigger(trigger.triggerId!)}
										type="button"
									>
										<EditIcon className="size-3 fill-white" />
										<span className="text-sm">{t("actions.edit")}</span>
									</button>
									<button
										aria-label={tTriggers("table.buttons.ariaShowTriggerEvents", {
											name: trigger.name,
										})}
										className="flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
										onClick={() => handleShowEvents(trigger.triggerId!)}
										type="button"
									>
										<EventsFlag className="size-4 stroke-white" />
										<span className="text-sm">{t("actions.showEvents")}</span>
									</button>
									<button
										aria-label={tTriggers("table.buttons.ariaDeleteTrigger", {
											name: trigger.name,
										})}
										className="flex h-8 w-160 items-center gap-2 justify-self-auto px-1 hover:text-green-800"
										onClick={() => handleDeleteTrigger()}
										type="button"
									>
										<TrashIcon className="size-4 stroke-white" />
										<span className="text-sm">{t("actions.delete")}</span>
									</button>
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
				<div className="flex w-full justify-end">
					<Button
						ariaLabel="Add Trigger"
						className="group !p-0 hover:bg-transparent hover:font-semibold"
						onClick={() => navigate(`/projects/${projectId}/triggers/add`)}
					>
						<CirclePlusIcon className="size-3 stroke-green-800 stroke-[1.225] transition-all group-hover:stroke-[2]" />
						<span className="text-sm text-green-800">Add</span>
					</Button>
				</div>
			</div>
		</Accordion>
	);
};
