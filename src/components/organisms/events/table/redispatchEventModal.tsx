import React from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { dateTimeFormat } from "@constants";
import { ModalName } from "@enums/components";
import { RedispatchEventModalProps } from "@interfaces/components";

import { useModalStore } from "@store";

import { Button, Input, Loader, Typography } from "@components/atoms";
import { Select, Modal, CopyButton } from "@components/molecules";

export const RedispatchEventModal = ({
	eventInfo,
	activeDeployment,
	isLoading,
	projectOptions,
	selectedProject,
	onProjectChange,
	onSubmit,
}: RedispatchEventModalProps) => {
	const { t } = useTranslation("modals", { keyPrefix: "redispatchEvent" });
	const { t: tEvents } = useTranslation("events");
	const { closeModal } = useModalStore();

	return (
		<Modal className="w-700 bg-gray-1100" hideCloseButton name={ModalName.redispatchEvent}>
			<div className="mx-6 text-white">
				<h3 className="text-xl font-bold">{t("title")}</h3>
				<p className="mb-6 mt-4">{t("desc")}</p>
				<Select
					label={t("projectName")}
					noOptionsLabel={t("noProjects")}
					onChange={onProjectChange}
					options={projectOptions}
					value={selectedProject}
				/>
				{activeDeployment ? (
					<div className="mt-6 flex items-stretch gap-2">
						<Input className="w-full" disabled label={t("activeDeploymentId")} value={activeDeployment} />
						<CopyButton
							className="shrink-0 bg-gray-1000"
							size="md"
							tabIndex={0}
							text={activeDeployment}
							title={activeDeployment}
						/>
					</div>
				) : (
					<Typography className="mt-4 font-fira-sans text-base font-medium">
						⚠️{t("projectdoesntHaveActiveDeployment")}
					</Typography>
				)}

				<Typography className="mb-3 mt-5 font-fira-sans font-medium">
					{tEvents("viewer.eventDetails")}:
				</Typography>
				<div className="mt-3 flex justify-between border-b border-gray-950 pb-3.5">
					<div className="flex flex-col gap-0.5 leading-6">
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550">{tEvents("viewer.eventType")}</div>
							{eventInfo?.type}
						</div>
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550">{tEvents("viewer.sourceName")}</div>
							{eventInfo?.destinationName} ({eventInfo?.destinationType})
						</div>
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550" title="Start Time">
								{tEvents("viewer.created")}
							</div>
							<div className="flex flex-row items-center">
								{moment(eventInfo?.createdAt).local().format(dateTimeFormat)}
							</div>
						</div>
						<div className="flex items-center gap-4">
							<div className="w-32 text-gray-1550" title="Start Time">
								{tEvents("viewer.sequence")}
							</div>
							<div className="flex flex-row items-center">{eventInfo?.sequence}</div>
						</div>
					</div>

					<div className="flex flex-col gap-0.5">
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{tEvents("viewer.eventId")}</div>
							<CopyButton text={eventInfo?.id || ""} />
						</div>
						<div className="flex items-center justify-end gap-4">
							<div className="leading-6">{tEvents("viewer.sourceId")}</div>
							<CopyButton text={eventInfo?.destinationId || ""} />
						</div>
					</div>
				</div>

				<Typography className="mb-3 mt-5 font-fira-sans font-medium">{tEvents("viewer.payload")}:</Typography>
				{eventInfo?.data ? (
					<JsonView
						className="scrollbar h-64 overflow-auto rounded-md border border-gray-1000 !bg-transparent p-2"
						style={githubDarkTheme}
						value={eventInfo.data}
					/>
				) : null}
			</div>
			<div className="mt-8 flex w-full justify-end gap-2">
				<Button
					ariaLabel={t("cancelButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					onClick={() => closeModal(ModalName.redispatchEvent)}
					variant="filled"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("submitButton")}
					className="px-4 py-3 font-semibold text-white hover:bg-gray-1100"
					disabled={isLoading || !activeDeployment}
					onClick={onSubmit}
					variant="outline"
				>
					{isLoading ? <Loader size="sm" /> : null}
					{t("submitButton")}
				</Button>
			</div>
		</Modal>
	);
};
