import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, TrashIcon } from "@assets/image/icons";
import { IconButton, Frame, TBody, THead, Table, Td, Th, Tr, Toast } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { SessionsTableState, SessionTableEditorFrame, SessionsTableFilter } from "@components/organisms/deployments";
import { ModalDeleteDeploymentSession } from "@components/organisms/modals";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { SessionLogRecord } from "@models";
import { reverseSessionStateConverter } from "@models/utils";
import { SessionsService } from "@services";
import { useModalStore } from "@store";
import { SortDirection } from "@type/components";
import { Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";
import { orderBy } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const SessionsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { openModal, closeModal } = useModalStore();
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionLog, setSessionLog] = useState<SessionLogRecord[]>();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Session;
	}>({ direction: SortDirectionVariant.ASC, column: "createdAt" });
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const frameClass = cn("pl-7 bg-gray-700 transition-all", {
		"w-3/4 rounded-r-none": !sessionId,
		"w-1/2": sessionId,
	});
	const sessionRowClass = (id: string) =>
		cn("group cursor-pointer hover:bg-gray-800", { "bg-black": id === sessionId });

	const fetchSessions = async (stateType?: number) => {
		if (!deploymentId) return;

		const { data, error } = await SessionsService.listByDeploymentId(deploymentId, { stateType });
		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}
		if (!data) return;

		setSessions(data);
	};

	const fetchSessionLog = useCallback(async () => {
		if (!sessionId) return;

		const { data, error } = await SessionsService.getLogRecordsBySessionId(sessionId);
		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}
		if (!data) return;

		setSessionLog(data);
	}, [sessionId]);

	useEffect(() => {
		fetchSessions();
	}, []);

	useEffect(() => {
		fetchSessionLog();
	}, [sessionId]);

	const toggleSortSessions = useCallback(
		(key: keyof Session) => {
			const newDirection =
				sort.column === key && sort.direction === SortDirectionVariant.ASC
					? SortDirectionVariant.DESC
					: SortDirectionVariant.ASC;
			setSort({ direction: newDirection, column: key });
		},
		[sort]
	);

	const sortedSessions = useMemo(() => orderBy(sessions, [sort.column], [sort.direction]), [sessions, sort]);

	const showDeleteModal = useCallback(() => {
		openModal(ModalName.deleteDeploymentSession);
	}, []);

	const handleRemoveSession = async () => {
		if (!sessionId) return;
		const { error } = await SessionsService.deleteSession(sessionId);
		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		closeModal(ModalName.deleteDeploymentSession);
		fetchSessions();
	};

	const openSessionLog = useCallback((sessionId: string) => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/${sessionId}`);
	}, []);

	const closeSessionLog = useCallback(() => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}`);
	}, []);

	const handleFilterSessions = (stateType?: SessionStateKeyType) => {
		const selectedSessionStateFilter = reverseSessionStateConverter(stateType);
		fetchSessions(selectedSessionStateFilter);
		closeSessionLog();
	};

	return (
		<div className="flex h-full">
			<Frame className={frameClass}>
				<div className="flex items-center justify-between gap-2.5">
					<div className="flex items-center flex-wrap gap-2.5">
						<IconButton
							ariaLabel={t("ariaLabelReturnBack")}
							className="gap-2 text-sm text-white bg-gray-600 hover:bg-black min-w-20"
							onClick={() => navigate(`/projects/${projectId}/deployments`)}
						>
							<ArrowLeft className="h-4" />
							{t("buttons.back")}
						</IconButton>
						<div className="text-base text-gray-300">
							{sessions.length} {t("sessionsName")}
						</div>
					</div>
					<SessionsTableFilter onChange={(state) => handleFilterSessions(state)} />
				</div>
				{sortedSessions.length ? (
					<Table className="mt-4">
						<THead>
							<Tr>
								<Th className="font-normal cursor-pointer group" onClick={() => toggleSortSessions("createdAt")}>
									{t("table.columns.activationTime")}
									<SortButton
										className="opacity-0 group-hover:opacity-100"
										isActive={"createdAt" === sort.column}
										sortDirection={sort.direction}
									/>
								</Th>
								<Th className="font-normal cursor-pointer group" onClick={() => toggleSortSessions("state")}>
									{t("table.columns.status")}
									<SortButton
										className="opacity-0 group-hover:opacity-100"
										isActive={"state" === sort.column}
										sortDirection={sort.direction}
									/>
								</Th>
								<Th
									className="font-normal border-0 cursor-pointer group"
									onClick={() => toggleSortSessions("sessionId")}
								>
									{t("table.columns.sessionId")}
									<SortButton
										className="opacity-0 group-hover:opacity-100"
										isActive={"sessionId" === sort.column}
										sortDirection={sort.direction}
									/>
								</Th>

								<Th className="border-0 max-w-12" />
							</Tr>
						</THead>
						<TBody className="bg-gray-700">
							{sortedSessions.map(({ sessionId, createdAt, state }) => (
								<Tr className={sessionRowClass(sessionId)} key={sessionId} onClick={() => openSessionLog(sessionId)}>
									<Td>{moment(createdAt).utc().format("YYYY-MM-DD HH:mm:ss")}</Td>
									<Td className="text-green-accent">
										<SessionsTableState sessionState={state} />
									</Td>
									<Td className="border-r-0">{sessionId}</Td>
									<Td className="max-w-12 border-0 pr-1.5 justify-end">
										<IconButton onClick={showDeleteModal}>
											<TrashIcon className="w-3 h-3 fill-white" />
										</IconButton>
									</Td>
								</Tr>
							))}
						</TBody>
					</Table>
				) : (
					<div className="mt-10 text-xl font-semibold text-center">{t("noSessions")}</div>
				)}
			</Frame>
			<SessionTableEditorFrame isSelectedSession={!!sessionId} onClose={closeSessionLog} session={sessionLog} />
			<ModalDeleteDeploymentSession onDelete={handleRemoveSession} />
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={tErrors("error")}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
