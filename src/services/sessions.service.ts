import {
	Session as ProtoSession,
	SessionLogRecord as ProtoSessionLogRecord,
} from "@ak-proto-ts/sessions/v1/session_pb";
import { StartRequest } from "@ak-proto-ts/sessions/v1/svc_pb";
import { sessionsClient } from "@api/grpc/clients.grpc.api";
import { defaultSessionsVisiblePageSize, namespaces } from "@constants";
import { SessionLogRecord, convertSessionProtoToModel } from "@models";
import { reverseSessionStateConverter } from "@models/utils";
import { DeploymentsService, EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse, StartSessionArgsType } from "@type";
import { Session, SessionFilter } from "@type/models";
import { flattenArray } from "@utilities";
import i18n from "i18next";
import { get } from "lodash";

export class SessionsService {
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

	static async listByDeploymentId(
		deploymentId: string,
		projectId: string,
		filter?: SessionFilter,
		pageToken?: string,
		pageSize?: number
	): Promise<ServiceResponse<{ sessions: Session[]; nextPageToken: string; total: number }>> {
		try {
			const { sessions: sessionsResponse, nextPageToken } = await sessionsClient.list({
				deploymentId,
				stateType: filter?.stateType,
				pageToken,
				pageSize: pageSize || defaultSessionsVisiblePageSize,
			});
			const sessions = sessionsResponse.map((session: ProtoSession) => convertSessionProtoToModel(session));
			const { data, error } = await DeploymentsService.listByProjectId(projectId);
			if (error) throw error;

			const sessionStats = data?.[0]?.sessionStats || [];
			const total = sessionStats.reduce((totalCount, current) => {
				const currentSessionState = reverseSessionStateConverter(current.state);
				const countToAdd = !filter?.stateType || currentSessionState === filter.stateType ? current.count : 0;

				return totalCount + countToAdd;
			}, 0);
			return { data: { sessions, nextPageToken, total }, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async stop(sessionId: string): Promise<ServiceResponse<undefined>> {
		try {
			await sessionsClient.stop({ sessionId });

			return { data: undefined, error: undefined };
		} catch (error) {
			return { data: undefined, error };
		}
	}

	static async getLogRecordsBySessionId(sessionId: string): Promise<ServiceResponse<Array<SessionLogRecord>>> {
		try {
			const response = await sessionsClient.getLog({ sessionId });
			const sessionHistory = response.log?.records
				.map((state: ProtoSessionLogRecord) => new SessionLogRecord(state))
				.filter((record: SessionLogRecord) => record.logs);
			return { data: sessionHistory, error: undefined };
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
			const { data: environments, error: envError } = await EnvironmentsService.listByProjectId(projectId);
			if (envError) {
				return { data: undefined, error: envError };
			}

			if (!environments?.length) {
				const errorMessage = i18n.t("defaulEnvironmentNotFoundExtended", { projectId, ns: "services" });
				LoggerService.error(namespaces.projectService, errorMessage);
				return { data: undefined, error: new Error(errorMessage) };
			}

			const environment = environments[0];

			const sessionAsStartRequest = {
				session: { ...startSessionArgs, envId: environment.envId },
			} as unknown as StartRequest;
			const { sessionId } = await sessionsClient.start(sessionAsStartRequest);
			return { data: sessionId, error: undefined };
		} catch (error) {
			const log = i18n.t("sessionStartFailedExtended", { error, buildId: startSessionArgs.buildId, ns: "services" });
			LoggerService.error(namespaces.sessionsService, log);
			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Session[]>> {
		try {
			const { data: projecEnvironments, error: environmentsError } =
				await EnvironmentsService.listByProjectId(projectId);

			if (environmentsError) {
				LoggerService.error(namespaces.sessionsService, (environmentsError as Error).message);

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
					.map((response) => get(response, "value.sessions", []).map((session) => convertSessionProtoToModel(session)))
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

	static async deleteSession(sessionId: string): Promise<ServiceResponse<void>> {
		try {
			await sessionsClient.delete({ sessionId });
			return { data: undefined, error: undefined };
		} catch (error) {
			return { data: undefined, error };
		}
	}
}
