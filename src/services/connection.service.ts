import i18n from "i18next";

import { EventsService } from "./events.service";
import { connectionsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertConnectionProtoToModel } from "@models/connection.model";
import { IntegrationsService, LoggerService } from "@services";
import { integrationIcons } from "@src/constants/lists/connections";
import { stripGoogleConnectionName } from "@src/utilities";
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

	static async getByEventId(eventId: string): Promise<ServiceResponse<Connection>> {
		const { data: event, error: eventError } = await EventsService.get(eventId);
		if (eventError) {
			return { data: undefined, error: eventError };
		}

		if (!event) {
			const errorMessage = i18n.t("eventNotFound", {
				ns: "services",
				eventId,
			});
			LoggerService.error(namespaces.connectionService, errorMessage);

			return {
				data: undefined,
				error: new Error(errorMessage),
			};
		}

		if (!event.destinationId) {
			return { data: undefined, error: undefined };
		}

		const { data: connection } = await ConnectionService.get(event.destinationId);

		return {
			data: connection,
			error: undefined,
		};
	}

	static async get(connectionId: string): Promise<ServiceResponse<Connection>> {
		try {
			const { connection } = await connectionsClient.get({ connectionId });
			if (!connection) {
				LoggerService.error(namespaces.connectionService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}
			const { data: integrations, error: integrationsError } = await IntegrationsService.list();

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			if (!integrations || !integrations.length) {
				const errorMessage = i18n.t("intergrationsNotFound", {
					ns: "services",
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}
			const convertedConnection = convertConnectionProtoToModel(connection);
			const integration = integrations!.find(
				(integration) => integration.integrationId === connection.integrationId
			);
			if (integration) {
				convertedConnection.integrationName = integration.displayName;
				convertedConnection.integrationUniqueName = integration.uniqueName;
				const strippedIntegrationName = stripGoogleConnectionName(integration.uniqueName);
				convertedConnection.logo = integrationIcons[strippedIntegrationName];
			}

			return { data: convertedConnection, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.connectionService, (error as Error).message);

			return { data: undefined, error: new Error(error) };
		}
	}

	static async create(
		projectId: string,
		integrationName: string,
		connectionName: string
	): Promise<ServiceResponse<string>> {
		try {
			const { data: integrations, error: integrationsError } = await IntegrationsService.list();

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			if (!integrations || !integrations.length) {
				const errorMessage = i18n.t("intergrationsNotFoundExtended", {
					projectId,
					ns: "services",
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}

			const integration = integrations.find((integration) => integration.uniqueName === integrationName);
			if (!integration) {
				const errorMessage = i18n.t("noMatchingIntegrationExtended", {
					projectId,
					connectionName,
					integrationName,
					ns: "services",
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}

			const { connectionId } = await connectionsClient.create({
				connection: {
					projectId,
					name: connectionName,
					integrationId: integration.integrationId,
				},
			});

			if (!connectionId) {
				LoggerService.error(namespaces.connectionService, i18n.t("connectionNotFound", { ns: "services" }));

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
				LoggerService.error(namespaces.connectionService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}

			const convertedConnections = connections.map(convertConnectionProtoToModel);
			const { data: integrations, error: integrationsError } = await IntegrationsService.list();
			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			if (!integrations || !integrations.length) {
				const errorMessage = i18n.t("intergrationsNotFound", {
					ns: "services",
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

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
					const strippedIntegrationName = stripGoogleConnectionName(integration.uniqueName);
					connection.logo = integrationIcons[strippedIntegrationName];
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
				LoggerService.error(namespaces.connectionService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: new Error(i18n.t("connectionNotFound", { ns: "services" })) };
			}

			const convertedConnections = connections.map(convertConnectionProtoToModel);
			const { data: integrations, error: integrationsError } = await IntegrationsService.list();

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			if (!integrations || !integrations.length) {
				const errorMessage = i18n.t("intergrationsNotFoundExtended", {
					projectId,
					ns: "services",
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return {
					data: undefined,
					error: new Error(errorMessage),
				};
			}

			convertedConnections.map((connection) => {
				const integration = integrations.find(
					(integration) => integration.integrationId === connection.integrationId
				);

				if (!integration) {
					const errorMessage = i18n.t("noMatchingIntegrationDetailsProjectAndConnection", {
						projectId,
						connectionName: connection.name,
						connectionId: connection.connectionId,
						ns: "services",
					});
					LoggerService.error(namespaces.connectionService, errorMessage);

					return {
						data: undefined,
						error: new Error(errorMessage),
					};
				}

				connection.integrationName = integration.displayName;
				const strippedIntegrationName = stripGoogleConnectionName(integration.uniqueName);
				connection.logo = integrationIcons[strippedIntegrationName];
			});

			return { data: convertedConnections, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);

			return { data: undefined, error };
		}
	}
}
