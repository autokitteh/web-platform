import React, { useState, useEffect, useMemo } from "react";
import { LogoFrame, CatImage } from "@assets/image";
import { ArrowLeft, TrashIcon } from "@assets/image/icons";
import { IconButton, Frame, TBody, THead, Table, Td, Th, Tr, Toast } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { DeploymentSessionState } from "@components/organisms/deployments";
import { SortDirectionVariant } from "@enums/components";
import { SessionLogRecord } from "@models";
import Editor, { Monaco } from "@monaco-editor/react";
import { SessionsService } from "@services";
import { SortDirection } from "@type/components";
import { Session } from "@type/models";
import { cn } from "@utilities";
import { orderBy } from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const DeploymentSessions = () => {
	const { t: tErrors } = useTranslation("errors");
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionLog, setSessionLog] = useState<SessionLogRecord[]>();
	const [selectedSession, setSelectedSession] = useState<string>();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Session;
	}>({ direction: SortDirectionVariant.ASC, column: "createdAt" });
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const { deploymentId } = useParams();
	const navigate = useNavigate();

	const fetchSessions = async () => {
		if (!deploymentId) return;

		const { data, error } = await SessionsService.listByDeploymentId(deploymentId);
		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}
		if (!data) return;

		setSessions(data);
	};

	useEffect(() => {
		fetchSessions();
	}, [deploymentId]);

	const toggleSortSessions = (key: keyof Session) => {
		const newDirection =
			sort.column === key && sort.direction === SortDirectionVariant.ASC
				? SortDirectionVariant.DESC
				: SortDirectionVariant.ASC;

		setSort({ direction: newDirection, column: key });
	};

	const sortedSessions = useMemo(() => {
		return orderBy(sessions, [sort.column], [sort.direction]);
	}, [sessions, sort.column, sort.direction]);

	const handleRemoveSession = async (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		const { error } = await SessionsService.deleteSession(id);
		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}

		fetchSessions();
	};

	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.editor.defineTheme("myCustomTheme", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#000000",
			},
		});
	};

	const handleEditorDidMount = (_editor: unknown, monaco: Monaco) => {
		monaco.editor.setTheme("myCustomTheme");
	};

	const handleGetSessionLog = async (sessionId: string) => {
		setSelectedSession(sessionId);

		const { data, error } = await SessionsService.getLogRecordsBySessionId(sessionId);
		if (error) {
			setToast({ isOpen: true, message: (error as Error).message });
			return;
		}
		if (!data) return;

		setSessionLog(data);
	};

	const activeBodyRow = (sessionId: string) =>
		cn("group cursor-pointer hover:bg-gray-800", { "bg-black": sessionId === selectedSession });

	const sessionLogValue = sessionLog?.map(({ logs }) => logs).join("\n");

	return (
		<div className="flex h-full gap-2.5">
			<Frame className="pl-7 bg-gray-700 w-1/2">
				<div className="flex items-center gap-2.5">
					<IconButton
						ariaLabel={t("ariaLabelReturnBack")}
						className="bg-gray-600 hover:bg-black text-white gap-2 min-w-20 text-sm"
						onClick={() => navigate(-1)}
					>
						<ArrowLeft className="h-4" />
						{t("buttons.back")}
					</IconButton>
					<div className="text-gray-300 text-base">
						{sessions.length} {t("sessionsName")}
					</div>
				</div>
				{sortedSessions.length ? (
					<Table className="mt-4">
						<THead>
							<Tr>
								<Th className="cursor-pointer group font-normal" onClick={() => toggleSortSessions("createdAt")}>
									{t("table.columns.activationTime")}
									<SortButton
										className="opacity-0 group-hover:opacity-100"
										isActive={"createdAt" === sort.column}
										sortDirection={sort.direction}
									/>
								</Th>
								<Th className="cursor-pointer group font-normal" onClick={() => toggleSortSessions("state")}>
									{t("table.columns.status")}
									<SortButton
										className="opacity-0 group-hover:opacity-100"
										isActive={"state" === sort.column}
										sortDirection={sort.direction}
									/>
								</Th>
								<Th
									className="cursor-pointer group font-normal border-0"
									onClick={() => toggleSortSessions("sessionId")}
								>
									{t("table.columns.sessionId")}
									<SortButton
										className="opacity-0 group-hover:opacity-100"
										isActive={"sessionId" === sort.column}
										sortDirection={sort.direction}
									/>
								</Th>

								<Th className="max-w-12 border-0" />
							</Tr>
						</THead>
						<TBody className="bg-gray-700">
							{sortedSessions.map(({ sessionId, createdAt, state }) => (
								<Tr className={activeBodyRow(sessionId)} key={sessionId} onClick={() => handleGetSessionLog(sessionId)}>
									<Td>{moment(createdAt).utc().format("YYYY-MM-DD HH:mm:ss")}</Td>
									<Td className="text-green-accent">
										<DeploymentSessionState sessionState={state} />
									</Td>
									<Td className="border-r-0">{sessionId}</Td>
									<Td className="max-w-12 border-0 pr-1.5 justify-end">
										<IconButton onClick={(e) => handleRemoveSession(e, sessionId)}>
											<TrashIcon className="fill-white w-3 h-3" />
										</IconButton>
									</Td>
								</Tr>
							))}
						</TBody>
					</Table>
				) : (
					<div className="mt-10 font-semibold text-xl text-center">{t("noSessions")}</div>
				)}
			</Frame>
			<Frame className="w-4/6">
				{sessionLog ? (
					<>
						<p className="font-bold mb-8">{t("output")}:</p>
						<Editor
							aria-label={selectedSession}
							beforeMount={handleEditorWillMount}
							className="-ml-6"
							defaultLanguage="json"
							onMount={handleEditorDidMount}
							options={{
								readOnly: true,
								minimap: {
									enabled: false,
								},
								lineNumbers: "off",
								renderLineHighlight: "none",
								wordWrap: "on",
							}}
							theme="vs-dark"
							value={sessionLogValue}
						/>
					</>
				) : (
					<div className="flex flex-col items-center mt-20">
						<p className="font-bold text-gray-400 text-lg mb-8">{t("noData")}</p>
						<CatImage className="border-b border-gray-400 fill-gray-400" />
					</div>
				)}

				<LogoFrame
					className={cn(
						"absolute fill-white opacity-10 pointer-events-none",
						"max-w-72 2xl:max-w-80 3xl:max-w-420 -bottom-10 2xl:bottom-7 right-2 2xl:right-7"
					)}
				/>
			</Frame>
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
