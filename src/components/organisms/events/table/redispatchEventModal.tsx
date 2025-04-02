import React, { useCallback, useEffect, useState } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ModalName } from "@enums/components";
import { DeploymentsService, EventsService, LoggerService } from "@services";
import { dateTimeFormat, namespaces } from "@src/constants";
import { DeploymentStateVariant, EventTypes } from "@src/enums";
import { EnrichedEvent } from "@src/types/models";

import { useModalStore, useProjectStore, useToastStore } from "@store";

import { Button, Input, Loader, Table, TBody, Td, Th, THead, Tr, Typography } from "@components/atoms";
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
	const navigate = useNavigate();

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

	const handleNavigation = () => {
		if (!eventInfo) return;

		const { destinationId, destinationType, projectId } = eventInfo;
		const path = destinationType === EventTypes.trigger ? "triggers" : "connections";

		navigate(`/projects/${projectId}/${path}/${destinationId}/edit`);
	};

	return (
		<Modal className="w-700" hideCloseButton name={ModalName.redispatchEvent}>
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
				<Typography className="mt-3 font-fira-sans font-medium">{tEvents("viewer.eventDetails")}:</Typography>
				<Table>
					<THead>
						<Tr>
							<Th className="ml-2 w-1/5">{tEvents("viewer.eventType")}</Th>
							<Th className="w-2/4">{tEvents("viewer.sourceName")}</Th>
							<Th className="w-1/4">{tEvents("viewer.created")}</Th>
							<Th className="w-1/6">{tEvents("viewer.sequence")}</Th>
						</Tr>
					</THead>
					<TBody className="overflow-hidden rounded-b-md">
						<Tr>
							<Td className="ml-2 w-1/5">{eventInfo?.type}</Td>
							<Td
								className="w-2/4 cursor-pointer select-none text-blue-500 underline transition hover:text-blue-500/85"
								onClick={handleNavigation}
							>
								{eventInfo?.destinationName} ({eventInfo?.destinationType})
							</Td>
							<Td className="w-1/4">{moment(eventInfo?.createdAt).local().format(dateTimeFormat)}</Td>
							<Td className="w-1/6">{eventInfo?.sequence}</Td>
						</Tr>
					</TBody>
				</Table>

				<Typography className="mt-3 font-fira-sans font-medium">{tEvents("viewer.payload")}:</Typography>
				{eventInfo?.data ? (
					<JsonView className="h-64 overflow-auto" style={githubDarkTheme} value={eventInfo.data} />
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
