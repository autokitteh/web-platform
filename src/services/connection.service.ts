import i18n from "i18next";

import { connectionsClient, integrationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertConnectionProtoToModel } from "@models/connection.model";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Connection } from "@type/models";

export class ConnectionService {
	static async delete(connectionId: string): Promise<ServiceResponse<void>> {
		try {
			await connectionsClient.delete({ connectionId });

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("connectionDeleteFailedExtended", {
				connectionId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async get(connectionId: string): Promise<ServiceResponse<Connection>> {
		try {
			const { connection } = await connectionsClient.get({ connectionId });
			if (!connection) {
				LoggerService.error(namespaces.triggerService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}
			const { integrations } = await integrationsClient.list({});
			if (!integrations) {
				const errorMessage = i18n.t("intergrationsNotFoundExtended", {
					ns: "services",
					projectId: connection.projectId,
				});
				LoggerService.error(namespaces.triggerService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}

			const convertedConnection = convertConnectionProtoToModel(connection);
			const integration = integrations.find(
				(integration) => integration.integrationId === connection.integrationId
			);
			convertedConnection.integrationName = integration?.displayName;

			return { data: convertedConnection, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.connectionService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async create(
		projectId: string,
		integrationName: string = "github",
		connectionName: string
	): Promise<ServiceResponse<string>> {
		try {
			const { integrations } = await integrationsClient.list({});
			if (!integrations || !integrations.length) {
				const errorMessage = i18n.t("intergrationsNotFoundExtended", {
					projectId,
					ns: "services",
				});
				LoggerService.error(namespaces.triggerService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}

			const integration = integrations.find((integration) => integration.uniqueName === integrationName);
			if (!integration) {
				return { data: undefined, error: undefined };
			}

			const { connectionId } = await connectionsClient.create({
				connection: {
					projectId,
					name: connectionName,
					integrationId: integration.integrationId,
				},
			});

			if (!connectionId) {
				LoggerService.error(namespaces.triggerService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}

			return { data: connectionId, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.connectionService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async list(): Promise<ServiceResponse<Connection[]>> {
		try {
			const { connections } = await connectionsClient.list({});
			if (!connections) {
				LoggerService.error(namespaces.triggerService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}

			const convertedConnections = connections.map(convertConnectionProtoToModel);
			const { integrations } = await integrationsClient.list({});
			if (!integrations) {
				const errorMessage = i18n.t("intergrationsNotFound", { ns: "services" });
				LoggerService.error(namespaces.triggerService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}
			convertedConnections.map((connection) => {
				const integration = integrations.find(
					(integration) => integration.integrationId === connection.integrationId
				);
				if (integration) {
					connection.integrationName = integration.displayName;
				}
			});

			return { data: convertedConnections, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Connection[]>> {
		try {
			const { connections } = await connectionsClient.list({ projectId });
			if (!connections) {
				LoggerService.error(namespaces.triggerService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}

			const convertedConnections = connections.map(convertConnectionProtoToModel);
			const { integrations } = await integrationsClient.list({});
			if (!integrations) {
				const errorMessage = i18n.t("intergrationsNotFoundExtended", { ns: "services", projectId });
				LoggerService.error(namespaces.triggerService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}
			convertedConnections.map((connection) => {
				const integration = integrations.find(
					(integration) => integration.integrationId === connection.integrationId
				);
				if (integration) {
					connection.integrationName = integration.displayName;
				}
			});

			return { data: convertedConnections, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}
}
