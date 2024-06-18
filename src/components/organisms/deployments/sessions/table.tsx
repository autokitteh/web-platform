import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CatImage } from "@assets/image";
import { ArrowLeft } from "@assets/image/icons";
import { IconButton, Frame, TBody, THead, Table, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal } from "@components/organisms/deployments/sessions";
import { SessionsTableRow } from "@components/organisms/deployments/sessions";
import { fetchSessionsInterval } from "@constants";
import { ModalName, SortDirectionVariant } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { SessionsService } from "@services";
import { useModalStore, useToastStore } from "@store";
import { SortDirection } from "@type/components";
import { Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";
import { orderBy } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { FixedSizeList as List } from "react-window";

export const SessionsTable = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { openModal, closeModal } = useModalStore();
	const { projectId, deploymentId, sessionId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Session;
	}>({ direction: SortDirectionVariant.DESC, column: "createdAt" });
	const [initialLoad, setInitialLoad] = useState(true);

	const frameClass = cn("pl-7 bg-gray-700 transition-all", {
		"w-3/4 rounded-r-none": !sessionId,
		"w-1/2": sessionId,
	});

	const fetchSessions = async () => {
		if (!deploymentId) return;

		const { data, error } = await SessionsService.listByDeploymentId(deploymentId, { stateType: sessionStateType });
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}
		if (!data) return;

		setSessions(data);
	};

	useEffect(() => {
		fetchSessions();

		const sessionsFetchIntervalId = setInterval(fetchSessions, fetchSessionsInterval);
		return () => clearInterval(sessionsFetchIntervalId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStateType]);

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

	const sortedSessions = useMemo(() => {
		if (initialLoad) {
			setInitialLoad(false);
			return sessions;
		}
		return orderBy(sessions, [sort.column], [sort.direction]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessions, sort]);

	const showDeleteModal = useCallback(() => {
		openModal(ModalName.deleteDeploymentSession);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleRemoveSession = async () => {
		if (!sessionId) return;
		const { error } = await SessionsService.deleteSession(sessionId);
		if (error) {
			addToast({
				id: Date.now().toString(),
				message: (error as Error).message,
				type: "error",
				title: tErrors("error"),
			});
			return;
		}

		closeModal(ModalName.deleteDeploymentSession);
		fetchSessions();
	};

	const openSessionLog = useCallback((sessionId: string) => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions/${sessionId}`);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleFilterSessions = (stateType?: SessionStateKeyType) => {
		const selectedSessionStateFilter = reverseSessionStateConverter(stateType);
		setSessionStateType(selectedSessionStateFilter);
	};
	const sessionLogsEditorClass = cn("w-3/5 transition pt-20 bg-gray-700 rounded-l-none");

	const itemData = useMemo(
		() => ({
			sessions: sortedSessions,
			selectedSessionId: sessionId,
			openSessionLog,
			showDeleteModal,
		}),
		[sortedSessions, sessionId, openSessionLog, showDeleteModal]
	);

	return (
		<div className="flex w-full h-full">
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
					<SessionsTableFilter onChange={handleFilterSessions} />
				</div>
				{sortedSessions.length ? (
					<Table className="flex-1 mt-4">
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
							<List
								className="scrollbar"
								height={400}
								itemCount={sortedSessions.length}
								itemData={itemData}
								itemKey={(idx) => sessions?.[idx]?.sessionId || 0}
								itemSize={48}
								width="100%"
							>
								{SessionsTableRow}
							</List>
						</TBody>
					</Table>
				) : (
					<div className="mt-10 text-xl font-semibold text-center">{t("noSessions")}</div>
				)}
			</Frame>
			{sessionId ? (
				<Outlet />
			) : (
				<Frame className={sessionLogsEditorClass}>
					<div className="flex flex-col items-center mt-20">
						<p className="mb-8 text-lg font-bold text-gray-400">{t("noSelectedSession")}</p>
						<CatImage className="border-b border-gray-400 fill-gray-400" />
					</div>
				</Frame>
			)}
			<DeleteSessionModal onDelete={handleRemoveSession} />
		</div>
	);
};
