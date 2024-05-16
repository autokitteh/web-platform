import React, { useState, useEffect } from "react";
import { LogoFrame } from "@assets/image";
import { ArrowLeft, TrashIcon } from "@assets/image/icons";
import { IconButton, Frame, TBody, THead, Table, Td, Th, Tr } from "@components/atoms";
import { SortButton } from "@components/molecules";
import { ESortDirection } from "@enums/components";
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
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const [sessions, setSessions] = useState<Session[]>([]);
	const [sessionInputs, setSessionInputs] = useState<string>();
	const [selectedSession, setSelectedSession] = useState<string>();
	const [sort, setSort] = useState<{
		direction: SortDirection;
		column: keyof Session;
	}>({ direction: ESortDirection.ASC, column: "createdAt" });
	const { deploymentId } = useParams();
	const navigate = useNavigate();

	const fetchSessions = async () => {
		if (!deploymentId) return;
		const { data } = await SessionsService.listByDeploymentId(deploymentId);
		data && setSessions(data);
	};

	useEffect(() => {
		fetchSessions();
	}, [deploymentId]);

	const toggleSortSessions = (key: keyof Session) => {
		const newDirection =
			sort.column === key && sort.direction === ESortDirection.ASC ? ESortDirection.DESC : ESortDirection.ASC;

		const sortedSessions = orderBy(sessions, [key], [newDirection]);
		setSort({ direction: newDirection, column: key });
		setSessions(sortedSessions);
	};

	const handleRemoveSession = async (event: React.MouseEvent, id: string) => {
		event.stopPropagation();
		await SessionsService.deleteSession(id);
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

	const handleSessionInputs = async (sessionId: string, inputs: object) => {
		setSelectedSession(sessionId);
		setSessionInputs(JSON.stringify(inputs, null, 2));
	};

	const activeBodyRow = (sessionId: string) =>
		cn("group cursor-pointer hover:bg-gray-800", { "bg-black": sessionId === selectedSession });

	return (
		<div className="flex h-full">
			<Frame className="pl-7 bg-gray-700 rounded-r-none w-2/4">
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
				{sessions.length ? (
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
							{sessions.map(({ sessionId, createdAt, inputs }) => (
								<Tr
									className={activeBodyRow(sessionId)}
									key={sessionId}
									onClick={() => handleSessionInputs(sessionId, inputs)}
								>
									<Td>{moment(createdAt).utc().format("YYYY-MM-DD HH:mm:ss")}</Td>
									<Td className="text-green-accent">{t("table.statuses.completed")}</Td>
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
			<Frame className="w-2/4 rounded-l-none">
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
					}}
					theme="vs-dark"
					value={sessionInputs}
				/>
				<LogoFrame
					className={cn(
						"absolute fill-white opacity-10 pointer-events-none",
						"max-w-72 2xl:max-w-80 3xl:max-w-420 -bottom-10 2xl:bottom-7 right-2 2xl:right-7"
					)}
				/>
			</Frame>
		</div>
	);
};
