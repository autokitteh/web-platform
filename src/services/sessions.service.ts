import i18n from "i18next";
import { omit } from "lodash";

import {
	Session as ProtoSession,
	SessionLogRecord as ProtoSessionLogRecord,
	SessionLogRecord_Type,
} from "@ak-proto-ts/sessions/v1/session_pb";
import { StartRequest } from "@ak-proto-ts/sessions/v1/svc_pb";
import { sessionsClient } from "@api/grpc/clients.grpc.api";
import { defaultSessionsVisiblePageSize, namespaces } from "@constants";
import { convertSessionLogProtoToModel, convertSessionProtoToModel, convertSessionProtoToViewerModel } from "@models";
import { LoggerService } from "@services";
import { SessionLogType } from "@src/enums";
import { Session, SessionFilter, SessionOutputLog, ViewerSession } from "@src/interfaces/models";
import { ServiceResponse, StartSessionArgsType } from "@type";

export class SessionsService {
	static async deleteSession(sessionId: string): Promise<ServiceResponse<void>> {
		try {
			await sessionsClient.delete({ sessionId });

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("sessionStopFailedExtended", {
				ns: "services",
				sessionId,
				error: (error as Error).message,
			});
			LoggerService.error(namespaces.sessionsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async getOutputsBySessionId(
		sessionId: string,
		pageToken?: string,
		pageSize?: number
	): Promise<ServiceResponse<{ logs: SessionOutputLog[]; nextPageToken: string }>> {
		const { prints, nextPageToken } = await sessionsClient.getPrints({ sessionId, pageSize, pageToken });
		const processedPrints = prints?.map((print) => convertSessionLogProtoToModel(print)) || [];
		return {
			data: {
				logs: processedPrints,
				nextPageToken: nextPageToken,
			},
			error: undefined,
		};
	}

	static async getLogRecordsBySessionId(
		sessionId: string,
		pageToken?: string,
		pageSize?: number,
		logType?: SessionLogType
	): Promise<ServiceResponse<{ count: number; nextPageToken?: string; records: Array<ProtoSessionLogRecord> }>> {
		try {
			const selectedTypes =
				logType === SessionLogType.State
					? SessionLogRecord_Type.STATE
					: SessionLogRecord_Type.CALL_SPEC |
						SessionLogRecord_Type.CALL_ATTEMPT_START |
						SessionLogRecord_Type.CALL_ATTEMPT_COMPLETE;

			const response = await sessionsClient.getLog({
				sessionId,
				pageSize,
				pageToken,
				jsonValues: true,
				ascending: false,
				types: selectedTypes,
			});

			return {
				data: {
					records: response?.log?.records || [],
					nextPageToken: response.nextPageToken,
					count: Number(response.count),
				},
				error: undefined,
			};
		} catch (error) {
			const errorMessage = i18n.t("failedFetchingLogRecordsBySessionId", {
				ns: "services",
				sessionId,
				error: (error as Error).message,
				pageToken,
				pageSize,
				logType,
			});
			LoggerService.error(namespaces.sessionsService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}

	static async getSessionInfo(sessionId: string): Promise<ServiceResponse<ViewerSession>> {
		try {
			const { session } = await sessionsClient.get({ sessionId, jsonValues: true });
			if (!session) {
				const errorMessage = i18n.t("sessionInfoFetchFailed", { sessionId, ns: "services" });
				LoggerService.error(namespaces.sessionsService, errorMessage);

				return { data: undefined, error: errorMessage };
			}
			const sessionConverted = convertSessionProtoToViewerModel(session);

			return { data: sessionConverted, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("sessionInfoFetchFailedExtended", {
				error: (error as Error).message,
				sessionId,
				ns: "services",
			});
			LoggerService.error(namespaces.sessionsService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async listByDeploymentId(
		deploymentId: string,
		filter?: SessionFilter,
		pageToken?: string,
		pageSize?: number
	): Promise<ServiceResponse<{ nextPageToken: string; sessions: Session[] }>> {
		try {
			const { nextPageToken, sessions: sessionsResponse } = await sessionsClient.list({
				deploymentId,
				pageSize: pageSize || defaultSessionsVisiblePageSize,
				pageToken,
				stateType: filter?.stateType,
			});

			const sessions = sessionsResponse.map((session: ProtoSession) => convertSessionProtoToModel(session));

			return { data: { nextPageToken, sessions }, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async listByProjectId(
		projectId: string,
		filter?: SessionFilter,
		pageToken?: string,
		pageSize?: number
	): Promise<ServiceResponse<{ nextPageToken: string; sessions: Session[] }>> {
		try {
			const { nextPageToken, sessions: sessionsResponse } = await sessionsClient.list({
				projectId,
				pageSize: pageSize || defaultSessionsVisiblePageSize,
				pageToken,
				stateType: filter?.stateType,
			});

			const sessions = sessionsResponse.map((session: ProtoSession) => convertSessionProtoToModel(session));

			return { data: { nextPageToken, sessions }, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async startSession(
		startSessionArgs: StartSessionArgsType,
		projectId: string
	): Promise<ServiceResponse<string>> {
		try {
			const sessionToStart = { ...omit(startSessionArgs, "jsonInputs"), projectId };
			const sessionAsStartRequest = {
				session: sessionToStart,
				jsonObjectInput: startSessionArgs.jsonInputs,
			} as unknown as StartRequest;
			const { sessionId } = await sessionsClient.start(sessionAsStartRequest);

			return { data: sessionId, error: undefined };
		} catch (error) {
			const log = i18n.t("sessionStartFailedExtended", {
				buildId: startSessionArgs.buildId,
				error,
				ns: "services",
			});
			LoggerService.error(namespaces.sessionsService, log);

			return { data: undefined, error };
		}
	}

	static async stop(sessionId: string): Promise<ServiceResponse<undefined>> {
		try {
			await sessionsClient.stop({ sessionId, terminate: true, terminationDelay: { seconds: 2n } });

			return { data: undefined, error: undefined };
		} catch (error) {
			const log = i18n.t("failedStopSessionExtended", {
				sessionId,
				error,
				ns: "errors",
			});
			LoggerService.error(namespaces.sessionsService, log);

			return { data: undefined, error };
		}
	}
}
