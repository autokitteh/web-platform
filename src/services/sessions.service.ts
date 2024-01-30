import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { sessionsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { SessionState, convertSessionProtoToModel } from "@models";
import { EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { ProtoSessionHistoryState, Session } from "@type/models";
import { flattenArray } from "@utilities";
import { get } from "lodash";

export class SessionsService {
	static async listByEnvironmentId(environmentId: string): Promise<ServiceResponse<Session[]>> {
		try {
			const response = await sessionsClient.list({ envId: environmentId });
			const sessions = response.sessions.map(convertSessionProtoToModel);
			return { data: sessions, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async listByDeploymentId(deploymentId: string): Promise<ServiceResponse<Session[]>> {
		try {
			const response = await sessionsClient.list({ deploymentId });
			const sessions = response.sessions.map((session: ProtoSession) => convertSessionProtoToModel(session));
			return { data: sessions, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async getHistoryBySessionId(sessionId: string): Promise<ServiceResponse<Array<SessionState>>> {
		try {
			const response = await sessionsClient.getHistory({ sessionId });
			const sessionHistory = response.history?.states.map((state: ProtoSessionHistoryState) => new SessionState(state));
			return { data: sessionHistory, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Session[]>> {
		try {
			const { data: projectEnvironments, error: environmentsError } =
				await EnvironmentsService.listByProjectId(projectId);

			if (environmentsError) {
				LoggerService.error(namespaces.sessionsService, (environmentsError as Error).message);

				return { data: undefined, error: environmentsError };
			}
			const sessionsPromises = (projectEnvironments || []).map(async (environment) => {
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
}
