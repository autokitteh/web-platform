import i18n from "i18next";
import { get, omit } from "lodash";

import {
	Session as ProtoSession,
	SessionLogRecord as ProtoSessionLogRecord,
	SessionLogRecord_Type,
} from "@ak-proto-ts/sessions/v1/session_pb";
import { StartRequest } from "@ak-proto-ts/sessions/v1/svc_pb";
import { sessionsClient } from "@api/grpc/clients.grpc.api";
import { defaultSessionsVisiblePageSize, namespaces } from "@constants";
import { convertSessionProtoToModel } from "@models";
import { EnvironmentsService, EventsService, LoggerService } from "@services";
import { SessionLogType } from "@src/enums";
import { convertSessionProtoToViewerModel } from "@src/models/session.model";
import { ViewerSession } from "@src/types/models/session.type";
import { ServiceResponse, StartSessionArgsType } from "@type";
import { Session, SessionFilter } from "@type/models";
import { flattenArray, transformAndStringifyValues } from "@utilities";

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

	static async getLogRecordsBySessionId(
		sessionId: string,
		pageToken?: string,
		pageSize?: number,
		logType?: SessionLogType
	): Promise<ServiceResponse<{ count: number; nextPageToken?: string; records: Array<ProtoSessionLogRecord> }>> {
		try {
			const selectedTypes =
				logType === SessionLogType.Output
					? SessionLogRecord_Type.PRINT | SessionLogRecord_Type.STATE
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

			if (!session?.eventId) {
				const sessionConverted = convertSessionProtoToViewerModel(session!);

				return {
					data: sessionConverted,
					error: undefined,
				};
			}

			const { data: event, error } = await EventsService.getEnriched(session.eventId);

			if (error) {
				const errorMessage = i18n.t("sessionMissingEventInfoExtended", {
					error: (error as Error).message,
					sessionId,
					eventId: session.eventId,
					ns: "services",
				});
				LoggerService.error(namespaces.sessionsService, errorMessage);

				return { data: undefined, error };
			}

			const sessionConverted = convertSessionProtoToViewerModel(
				session!,
				event?.sourceType,
				event?.destinationName
			);

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

	static async listByEnvironmentId(environmentId: string): Promise<ServiceResponse<Session[]>> {
		try {
			const { sessions: sessionsResponse } = await sessionsClient.list({ envId: environmentId });

			const sessions = sessionsResponse.map(convertSessionProtoToModel);

			return { data: sessions, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Session[]>> {
		try {
			const { data: projecEnvironments, error: environmentsError } =
				await EnvironmentsService.listByProjectId(projectId);

			if (environmentsError) {
				return { data: undefined, error: environmentsError };
			}
			const sessionsPromises = (projecEnvironments || []).map(async (environment) => {
				const sessions = await this.listByEnvironmentId(environment.envId);

				return sessions;
			});

			const sessionsResponses = await Promise.allSettled(sessionsPromises);

			const sessions = flattenArray<Session>(
				sessionsResponses
					.filter((response) => response.status === "fulfilled")
					.map((response) =>
						get(response, "value.sessions", []).map((session) => convertSessionProtoToModel(session))
					)
			);

			return { data: sessions, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return {
				data: undefined,
				error,
			};
		}
	}

	static async startSession(
		startSessionArgs: StartSessionArgsType,
		projectId: string
	): Promise<ServiceResponse<string>> {
		try {
			const { data: defaultEnvironment, error: envError } =
				await EnvironmentsService.getDefaultEnvironment(projectId);
			if (envError) {
				return { data: undefined, error: envError };
			}

			const sessionToStart = { ...omit(startSessionArgs, "jsonInputs"), envId: defaultEnvironment!.envId };
			const sessionAsStartRequest = {
				session: sessionToStart,
				jsonInputs: transformAndStringifyValues(startSessionArgs?.jsonInputs || {}),
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
			await sessionsClient.stop({ sessionId });

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
