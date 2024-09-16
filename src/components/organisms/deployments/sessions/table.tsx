import React, { useCallback, useEffect, useMemo, useState } from "react";

import { debounce, isEqual } from "lodash";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ListOnItemsRenderedProps } from "react-window";

import { namespaces } from "@constants";
import { ModalName } from "@enums/components";
import { reverseSessionStateConverter } from "@models/utils";
import { DeploymentsService, LoggerService, SessionsService } from "@services";
import { useResize } from "@src/hooks";
import { DeploymentSession, Session, SessionStateKeyType } from "@type/models";
import { cn } from "@utilities";

import { useModalStore, useToastStore } from "@store";

import { Button, Frame, IconButton, Loader } from "@components/atoms";
import { RefreshButton } from "@components/molecules";
import { SessionsTableFilter } from "@components/organisms/deployments";
import { DeleteSessionModal, SessionsTableList } from "@components/organisms/deployments/sessions";

import { CatImage } from "@assets/image";
import { ArrowLeft } from "@assets/image/icons";

export const SessionsTable = () => {
	const [leftSideWidth] = useResize({ direction: "horizontal", initial: 50, max: 90, min: 10 });
	const { t: tErrors } = useTranslation(["errors", "services"]);
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const { closeModal } = useModalStore();
	const { deploymentId, projectId, sessionId } = useParams();
	const navigate = useNavigate();
	const addToast = useToastStore((state) => state.addToast);

	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionStateType, setSessionStateType] = useState<number>();
	const [selectedSessionId, setSelectedSessionId] = useState<string>();
	const [sessionsNextPageToken, setSessionsNextPageToken] = useState<string>();
	const [sessionStats, setSessionStats] = useState<DeploymentSession[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const frameClass = useMemo(
		() =>
			cn("h-full w-full overflow-hidden bg-gray-1100 pb-3 pl-7 transition-all", {
				"rounded-r-none": !sessionId,
			}),
		[sessionId]
	);

	const fetchSessions = useCallback(
		async (nextPageToken?: string) => {
			const loaderTimeout = setTimeout(() => {
				setIsLoading(true);
			}, 1000);

			const { data, error } = await SessionsService.listByDeploymentId(
				deploymentId!,
				{
					stateType: sessionStateType,
				},
				nextPageToken
			);
			clearTimeout(loaderTimeout);
			setIsLoading(false);

			if (error) {
				addToast({
					message: tErrors("sessionsFetchError"),
					type: "error",
				});
				LoggerService.error(
					namespaces.sessionsService,
					tErrors("sessionsFetchErrorExtended", { error: (error as Error).message })
				);

				return;
			}
			if (!data?.sessions) {
				return;
			}
			setSessions((prevSessions) => {
				if (!nextPageToken) {
					return data.sessions;
				}

				return [...prevSessions, ...data.sessions];
			});
			setSessionsNextPageToken(data.nextPageToken);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[sessionStateType]
	);

	const debouncedFetchSessions = debounce(fetchSessions, 100);

	const fetchDeployments = useCallback(async () => {
		if (!projectId) {
			return;
		}

		const { data, error } = await DeploymentsService.listByProjectId(projectId!);
		if (error) {
			addToast({
				message: tErrors("failedFetchDeployments", { ns: "services" }),
				type: "error",
			});

			LoggerService.error(
				namespaces.projectUICode,
				tErrors("failedFetchDeploymentsExtended", { error: (error as Error).message })
			);

			return;
		}
		if (!data?.length) {
			return;
		}

		const deployment = data.find((deployment) => deployment.deploymentId === deploymentId);

		if (isEqual(deployment?.sessionStats, sessionStats) || !deployment?.sessionStats) {
			return;
		}

		setSessionStats(deployment?.sessionStats);
		await debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStats]);

	const debouncedFetchDeployments = debounce(fetchDeployments, 200);

	useEffect(() => {
		debouncedFetchDeployments();
		debouncedFetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sessionStateType]);

	const closeSessionLog = useCallback(() => {
		navigate(`/projects/${projectId}/deployments/${deploymentId}/sessions`);
	}, [navigate, projectId, deploymentId]);

	const handleRemoveSession = async () => {
		if (!selectedSessionId) {
			return;
		}
		const { error } = await SessionsService.deleteSession(selectedSessionId);
		if (error) {
			addToast({
				message: tErrors("failedRemoveSession"),
				type: "error",
			});
			LoggerService.error(
				namespaces.sessionsService,
				tErrors("failedRemoveSessionExtended", { sessionId: selectedSessionId })
			);

			return;
		}

		closeModal(ModalName.deleteDeploymentSession);
		closeSessionLog();
		debouncedFetchDeployments();
	};

	const handleFilterSessions = (stateType?: SessionStateKeyType) => {
		const selectedSessionStateFilter = reverseSessionStateConverter(stateType);
		setSessionStateType(selectedSessionStateFilter);
		closeSessionLog();
	};

	const handleItemsRendered = ({ visibleStopIndex }: ListOnItemsRenderedProps) => {
		if (visibleStopIndex >= sessions.length - 1 && sessionsNextPageToken) {
			debouncedFetchSessions(sessionsNextPageToken);
		}
	};

	const resizeClass = useMemo(
		() =>
			cn(
				"resize-handle-horizontal bg-gray-white z-0 h-[97%] cursor-ew-resize self-center rounded-none p-1.5 transition hover:bg-gray-750",
				{
					"h-full bg-gray-1100 p-1": !sessionId,
				}
			),
		[sessionId]
	);

	return (
		<div className="flex w-full">
			<div style={{ width: `${leftSideWidth}%` }}>
				<Frame className={frameClass}>
					<div className="flex items-center justify-between gap-2.5">
						<div className="flex flex-wrap items-center gap-2.5">
							<IconButton
								ariaLabel={t("ariaLabelReturnBack")}
								className="min-w-20 gap-2 bg-gray-1050 text-sm text-white hover:bg-black"
								onClick={() => navigate(`/projects/${projectId}/deployments`)}
							>
								<ArrowLeft className="h-4" />

								{t("buttons.back")}
							</IconButton>

							<RefreshButton isLoading={isLoading} onRefresh={fetchDeployments} />
						</div>

						<SessionsTableFilter onChange={handleFilterSessions} sessionStats={sessionStats} />
					</div>

					{sessions.length ? (
						<div className="relative flex h-full flex-col overflow-hidden">
							<div className="scrollbar mt-6 overflow-hidden rounded-t-14 text-white">
								<div className="sticky top-0 z-10 overflow-hidden bg-gray-1250 text-gray-500">
									<div className="flex justify-between border-b-2 border-gray-1050 transition hover:bg-gray-1250">
										<div className="flex h-9.5 w-56 items-center gap-1 truncate px-4 font-normal">
											{t("table.columns.startTime")}
										</div>

										<div className="flex h-9.5 w-32 items-center gap-1 truncate px-4 font-normal">
											{t("table.columns.status")}
										</div>

										<div className="flex h-9.5 w-80 items-center gap-1 truncate px-4 font-normal">
											{t("table.columns.sessionId")}
										</div>

										<div className="flex h-9.5 w-32 items-center gap-1 truncate px-4 font-normal">
											{t("table.columns.actions")}
										</div>
									</div>
								</div>
							</div>

							<SessionsTableList
								onItemsRendered={handleItemsRendered}
								onSelectedSessionId={setSelectedSessionId}
								onSessionRemoved={debouncedFetchDeployments}
								sessions={sessions}
							/>

							{isLoading ? (
								<div className="absolute bottom-0 z-20 flex h-10 w-full items-center bg-gray-1100">
									<Loader firstColor="light-gray" size="md" />
								</div>
							) : null}
						</div>
					) : (
						<div className="mt-10 text-center text-xl font-semibold">{t("noSessions")}</div>
					)}
				</Frame>
			</div>

			<Button className={resizeClass} />

			<div className="flex" style={{ width: `${100 - (leftSideWidth as number)}%` }}>
				{sessionId ? (
					<Outlet />
				) : (
					<Frame className="w-full rounded-l-none bg-gray-1100 pt-20 transition">
						<div className="mt-20 flex flex-col items-center">
							<p className="mb-8 text-lg font-bold text-gray-750">{t("noSelectedSession")}</p>

							<CatImage className="border-b border-gray-750 fill-gray-750" />
						</div>
					</Frame>
				)}
			</div>

			<DeleteSessionModal onDelete={handleRemoveSession} />
		</div>
	);
};
