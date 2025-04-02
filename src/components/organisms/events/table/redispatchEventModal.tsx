import React, { useEffect } from "react";

import JsonView from "@uiw/react-json-view";
import { githubDarkTheme } from "@uiw/react-json-view/githubDark";
import moment from "moment";
import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";
import { dateTimeFormat } from "@src/constants";

import { useEventRedispatch } from "@hooks";
import { useModalStore, useToastStore } from "@store";

import { Button, Input, Loader, Typography } from "@components/atoms";
import { Select, Modal, CopyButton } from "@components/molecules";

export const RedispatchEventModal = () => {
	const { t } = useTranslation("modals", { keyPrefix: "redispatchEvent" });
	const { t: tEvents } = useTranslation("events");
	const { closeModal } = useModalStore();
	const data = useModalStore((state) => state.data) as { eventId: string };
	const addToast = useToastStore((state) => state.addToast);

	const {
		eventInfo,
		eventInfoError,
		activeDeployment,
		redispatchLoading,
		projectOptions,
		selectedProject,
		setSelectedProject,
		handleRedispatch,
	} = useEventRedispatch(data?.eventId);

	const handleRedispatchClick = async () => {
		const result = await handleRedispatch();
		closeModal(ModalName.redispatchEvent);
		if (result.success) {
			addToast({ message: result.message, type: "success" });
			return;
		}
		addToast({ message: result.error, type: "error" });
	};

	useEffect(() => {
		if (eventInfoError) {
			addToast({ message: eventInfoError, type: "error" });
			closeModal(ModalName.redispatchEvent);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventInfoError]);

	return (
		<Modal className="w-700 bg-gray-1100" hideCloseButton name={ModalName.redispatchEvent}>
			<div className="mx-6 text-white">
				<h3 className="text-xl font-bold">{t("title")}</h3>
				<p className="mb-6 mt-4">{t("desc")}</p>
				<Select
					label={t("projectName")}
					noOptionsLabel={t("noProjects")}
					onChange={setSelectedProject}
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
							text={activeDeployment!}
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
					className="px-4 py-3 font-semibold text-white hover:bg-gray-1100"
					onClick={() => closeModal(ModalName.redispatchEvent)}
					variant="outline"
				>
					{t("cancelButton")}
				</Button>

				<Button
					ariaLabel={t("submitButton")}
					className="bg-gray-1100 px-4 py-3 font-semibold"
					disabled={redispatchLoading || !activeDeployment}
					onClick={handleRedispatchClick}
					variant="filled"
				>
					{redispatchLoading ? <Loader size="sm" /> : null}
					{t("submitButton")}
				</Button>
			</div>
		</Modal>
	);
};
