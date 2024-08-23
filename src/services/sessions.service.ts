import i18n from "i18next";
import { get } from "lodash";
import moment from "moment";

import { logRecords } from "./logRecords";
import {
	Session as ProtoSession,
	SessionLogRecord as ProtoSessionLogRecord,
} from "@ak-proto-ts/sessions/v1/session_pb";
import { StartRequest } from "@ak-proto-ts/sessions/v1/svc_pb";
import { sessionsClient } from "@api/grpc/clients.grpc.api";
import { defaultSessionsVisiblePageSize, namespaces } from "@constants";
import { SessionLogRecord, convertSessionProtoToModel } from "@models";
import { EnvironmentsService, LoggerService } from "@services";
import { SessionLogRecordType } from "@src/enums";
import { ServiceResponse, StartSessionArgsType } from "@type";
import { Session, SessionFilter } from "@type/models";
import { flattenArray } from "@utilities";

function convertLogsToActivities(logs) {
	const activities = [];
	let currentActivity = null;

	// Iterate over the logs in reverse order
	for (let i = logs.length - 1; i >= 0; i--) {
		const log = logs[i];
		const { callAttemptComplete, callAttemptStart, callSpec, state } = log;

		if (callSpec) {
			// Start a new activity
			if (currentActivity) {
				activities.push(currentActivity);
			}

			// Extract parameter names and their values
			const paramNames = callSpec.function.function.desc.input.map((param) => param.name);
			const paramValues = callSpec.args.map((arg) => (arg.string ? arg.string.v : null));

			const parameters = paramNames.reduce((acc, paramName, index) => {
				acc[paramName] = paramValues[index] || null;

				return acc;
			}, {});

			currentActivity = {
				functionName: `${callSpec.function.function.name}(${paramNames.join(", ")})`,
				parameters,
				status: "created",
				startTime: null,
				endTime: null,
				returnValue: null,
			};
		}

		if (callAttemptStart && currentActivity) {
			currentActivity.status = "running";
			currentActivity.startTime = callAttemptStart.startedAt;
		}

		if (callAttemptComplete && currentActivity) {
			currentActivity.status = "completed";
			currentActivity.endTime = callAttemptComplete.completedAt;
			currentActivity.returnValue = callAttemptComplete.result.value;
		}

		if (state && state.error && currentActivity) {
			currentActivity.status = "error";
		}
	}

	// Push the last activity if it exists
	if (currentActivity) {
		activities.push(currentActivity);
	}

	return activities;
}

export class SessionsService {
	static async deleteSession(sessionId: string): Promise<ServiceResponse<void>> {
		try {
			await sessionsClient.delete({ sessionId });

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("sessionStopFailedExtended", { ns: "services", sessionId });
			LoggerService.error(namespaces.sessionsService, errorMessage);

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

	static async getSessionActivitiesBySessionId(sessionId: string): Promise<ServiceResponse<Array<SessionLogRecord>>> {
		try {
			const response = await sessionsClient.getLog({ sessionId });
			const sessionHistory = response.log?.records.map(
				(state: ProtoSessionLogRecord) => new SessionLogRecord(state)
			);

			const activities = convertLogsToActivities(response.log?.records);
			console.log("activities", activities);

			return { data: sessionHistory, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async getLogPrintsBySessionId(sessionId: string): Promise<ServiceResponse<Array<SessionLogRecord>>> {
		try {
			const response = await sessionsClient.getLog({ sessionId });
			const sessionHistory = response.log?.records
				.map((state: ProtoSessionLogRecord) => {
					const record = new SessionLogRecord(state);

					if (record.logs && record.dateTime) {
						const formattedDateTime = moment(record.dateTime).format("MM-DD-YYYY HH:mm:ss");
						record.logs = `${formattedDateTime} ${record.logs}`;
					}

					return record;
				})
				.filter((record: SessionLogRecord) => record.type === SessionLogRecordType.print && record.logs);

			return { data: sessionHistory, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.sessionsService, (error as Error).message);

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

			const sessionAsStartRequest = {
				session: { ...startSessionArgs, envId: defaultEnvironment!.envId },
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
			return { data: undefined, error };
		}
	}
}
