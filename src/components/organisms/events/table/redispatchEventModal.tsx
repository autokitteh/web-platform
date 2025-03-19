import React, { useCallback, useEffect, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { DeploymentsService, EventsService, LoggerService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { DeploymentStateVariant } from "@src/enums";
import { EnrichedEvent } from "@src/types/models";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, Input, Loader, Typography } from "@components/atoms";
import { Select, Modal, CopyButton } from "@components/molecules";

export const RedispatchEventModal = ({ eventId }: { eventId: string }) => {
	const { t } = useTranslation("modals", { keyPrefix: "redispatchEvent" });
	const { t: tEvents } = useTranslation("events");
	const { t: tErrors } = useTranslation("errors");
	const { closeModal } = useModalStore();
	const { projectsList } = useProjectStore();
	const [activeDeployment, setActiveDeployment] = useState<string>();
	const addToast = useToastStore((state) => state.addToast);
	const [redispatchLoading, setRedispatchLoading] = useState(false);
	const [eventInfo, setEventInfo] = useState<EnrichedEvent>();

	const projectOptions = projectsList.map((project) => ({
		label: project.name,
		value: project.id,
	}));

	const [selectedProject, setSelectedProject] = useState(projectOptions[0]);

	useEffect(() => {
		const fetchDeployments = async () => {
			const { data: deployments } = await DeploymentsService.list(selectedProject.value);
			deployments?.forEach((deployment) => {
				if (deployment.state === DeploymentStateVariant.active) {
					setActiveDeployment(deployment.deploymentId);
				}
			});
		};
		fetchDeployments();
	}, [selectedProject]);

	const handleRedispatch = useCallback(
		async () => {
			if (!activeDeployment) return;

			try {
				setRedispatchLoading(true);
				const response = await EventsService.redispatch(eventId, activeDeployment);
				if (response.error) {
					throw new Error();
				}
				addToast({
					message: tEvents("table.redispatchSuccess"),
					type: "success",
				});
			} catch {
				addToast({
					message: tEvents("table.redispatchFailed"),
					type: "error",
				});
			} finally {
				setRedispatchLoading(false);
				closeModal(ModalName.redispatchEvent);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[eventId, activeDeployment]
	);

	const fetchEventInfo = useCallback(async () => {
		if (!eventId) return;
		const { data: eventInfoRes, error } = await EventsService.getEnriched(eventId);

		if (error) {
			addToast({ message: tErrors("errorFetchingEvent"), type: "error" });
			closeModal(ModalName.redispatchEvent);
			return;
		}
		if (!eventInfoRes) {
			addToast({ message: tErrors("eventNotFound"), type: "error" });
			LoggerService.error(namespaces.ui.eventsViewer, tErrors("eventNotFoundExtended", { eventId, error }));

			return;
		}
		setEventInfo(eventInfoRes);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	useEffect(() => {
		fetchEventInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId]);

	return (
		<Modal hideCloseButton name={ModalName.redispatchEvent}>
			<div className="mx-6">
				<h3 className="mb-2 text-xl font-bold">{t("title")}</h3>
				<p>{t("desc")}</p>
				<div className="mt-3">
					<Select
						label="Project Name"
						onChange={(option) => {
							if (option) {
								setSelectedProject(option);
							}
						}}
						options={projectOptions}
						value={selectedProject}
						variant="light"
					/>
				</div>
				<div className="mt-2 flex items-stretch gap-2">
					<Input className="w-full" disabled label="Depoyment ID" value={activeDeployment} variant="light" />
					<CopyButton
						className="shrink-0 bg-gray-1000"
						size="md"
						tabIndex={0}
						text={activeDeployment!}
						title={activeDeployment}
					/>
				</div>
				<div className="mt-2 flex flex-col gap-0.5 leading-6">
					<div className="flex items-center gap-4">
						<div className="w-20">{tEvents("viewer.eventType")}</div>
						<div className="font-medium">{eventInfo?.type}</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-20">{tEvents("viewer.sourceName")}</div>
						<div className="font-medium">
							{eventInfo?.destinationName} ({eventInfo?.destinationType})
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-20" title="Start Time">
							{tEvents("viewer.created")}
						</div>
						<div className="font-medium">{moment(eventInfo?.createdAt).local().format(dateTimeFormat)}</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="w-20" title="Start Time">
							{tEvents("viewer.sequence")}
						</div>
						<div className="font-medium">{eventInfo?.sequence}</div>
					</div>
				</div>

				<Typography className="mt-5 font-fira-sans font-medium">{tEvents("viewer.payload")}:</Typography>
				{eventInfo?.data ? (
					<JsonView
						className="scrollbar mt-1 max-h-64 overflow-auto"
						style={githubDarkTheme}
						value={eventInfo.data}
					/>
				) : null}
			</div>
			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="px-4 py-3 font-semibold hover:bg-gray-1100 hover:text-white"
					onClick={() => closeModal(ModalName.redispatchEvent)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("redispatchButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold hover:text-error"
					disabled={redispatchLoading}
					onClick={handleRedispatch}
					variant="filled"
				>
					{redispatchLoading ? <Loader size="sm" /> : null}
					{t("redispatchButton")}
				</Button>
			</div>
		</Modal>
	);
};
