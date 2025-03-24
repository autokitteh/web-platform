import React from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { dateTimeFormat } from "@src/constants";

import { useEventRedispatch } from "@hooks";
import { useModalStore, useToastStore } from "@store";

import { Button, Input, Loader, Table, TBody, Td, Th, THead, Tr, Typography } from "@components/atoms";
import { Select, Modal, CopyButton } from "@components/molecules";

export const RedispatchEventModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "redispatchEvent" });
	const { t: tEvents } = useTranslation("events");
	const { closeModal } = useModalStore();
	const data = useModalStore((state) => state.data) as { eventId: string };
	const addToast = useToastStore((state) => state.addToast);

	const {
		eventInfo,
		activeDeployment,
		redispatchLoading,
		projectOptions,
		selectedProject,
		setSelectedProject,
		handleRedispatch,
		handleNavigation,
	} = useEventRedispatch(data?.eventId);

	return (
		<Modal className="w-700 bg-gray-1100" hideCloseButton name={ModalName.redispatchEvent}>
			<div className="mx-6 text-white">
				<h3 className="mb-2 text-xl font-bold">{t("title")}</h3>
				<p>{t("desc")}</p>
				<div className="mt-3">
					<Select
						label={t("projectName")}
						noOptionsLabel={t("noProjects")}
						onChange={setSelectedProject}
						options={projectOptions}
						value={selectedProject}
					/>
				</div>
				{activeDeployment ? (
					<div className="mt-2 flex items-stretch gap-2">
						<Input className="w-full" disabled label={t("activeDeploymentId")} value={activeDeployment} />
						<CopyButton
							className="shrink-0 bg-gray-1000"
							size="md"
							tabIndex={0}
							text={activeDeployment!}
							title={activeDeployment}
						/>
					</div>
				) : (
					<Typography className="font-fira-sans text-lg font-medium">
						⚠️{t("projectdoesntHaveActiveDeployment")}
					</Typography>
				)}

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
						<Tr className="bg-gray-1050">
							<Td className="ml-2 w-1/5">{eventInfo?.type}</Td>
							<Td
								className="w-2/4 cursor-pointer select-none text-blue-500 underline transition hover:text-blue-500/80"
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
					className="px-4 py-3 font-semibold text-white hover:bg-gray-1100"
					onClick={() => closeModal(ModalName.redispatchEvent)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("redispatchButton")}
					className="bg-gray-1000 px-4 py-3 font-semibold hover:text-error"
					disabled={redispatchLoading || !activeDeployment}
					onClick={async () => {
						await handleRedispatch();
						addToast({ message: tEvents("table.redispatchSuccess"), type: "success" });
					}}
					variant="filled"
				>
					{redispatchLoading ? <Loader size="sm" /> : null}
					{t("redispatchButton")}
				</Button>
			</div>
		</Modal>
	);
};
