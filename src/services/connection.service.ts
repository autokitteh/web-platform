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
			LoggerService.info(
				namespaces.connectionService,
				i18n.t("connectionRemoveSuccessExtended", { ns: "services", connectionId })
			);

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
		try {
			const { data: event, error: eventError } = await EventsService.get(eventId);
			if (eventError) {
				const errorMessage = i18n.t("coulndtFetchConnectionByEventIdExtended", {
					ns: "services",
					eventId,
					error: eventError,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: eventError };
			}

			if (!event) {
				const errorMessage = i18n.t("eventNotFoundForConnectionExtended", {
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
				const errorMessage = i18n.t("destinationNotExistOnEvent", {
					ns: "services",
					eventId,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			const { data: connection } = await ConnectionService.get(event.destinationId);

			return {
				data: connection,
				error: undefined,
			};
		} catch (error) {
			const errorMessage = i18n.t("errorGettingConnectionByEventIdExtended", {
				ns: "services",
				eventId,
				error: (error as Error).message,
			});

			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async get(connectionId: string): Promise<ServiceResponse<Connection>> {
		try {
			const { connection } = await connectionsClient.get({ connectionId });
			if (!connection) {
				const errorMessage = i18n.t("connectionNotFound", { ns: "services" });
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: new Error(errorMessage) };
			}
			const { data: integrations, error: integrationsError } = await IntegrationsService.list();

			if (integrationsError) {
				const errorMessage = i18n.t("errorFetchingIntegrationsForConnectionsExtended", {
					ns: "services",
					connectionId,
					error: integrationsError,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			if (!integrations || !integrations.length) {
				const errorMessage = i18n.t("intergrationsNotFoundExtendedForConnection", {
					ns: "services",
					connectionId,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return {
					data: undefined,
					error: errorMessage,
				};
			}
			const convertedConnection = convertConnectionProtoToModel(connection);
			const integration = integrations!.find(
				(integration) => integration.integrationId === connection.integrationId
			);
			if (!integration) {
				const errorMessage = i18n.t("noMatchingIntegrationDetailsForConnection", {
					connectionId,
					connectionName: connection.name,
					ns: "services",
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return {
					data: undefined,
					error: errorMessage,
				};
			}

			convertedConnection.integrationName = integration.displayName;
			convertedConnection.integrationUniqueName = integration.uniqueName;
			const strippedIntegrationName = stripGoogleConnectionName(integration.uniqueName);
			convertedConnection.logo = integrationIcons[strippedIntegrationName];

			return { data: convertedConnection, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("errorGettingConnectionByIdExtended", {
				ns: "services",
				connectionId,
				error: (error as Error).message,
			});

			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error };
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
				const error = i18n.t("connectionNotCreated", { ns: "services" });
				LoggerService.error(namespaces.connectionService, error);

				return { data: undefined, error: new Error(error) };
			}

			return { data: connectionId, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("connectionNotCreatedExtended", {
				ns: "services",
				error: (error as Error).message,
			});

			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Connection[]>> {
		try {
			const { connections } = await connectionsClient.list({ projectId });

			const convertedConnections = connections.map(convertConnectionProtoToModel);
			const { data: integrations, error: integrationsError } = await IntegrationsService.list();

			if (integrationsError) {
				const errorMessage = i18n.t("noIntegrationsFoundForConnectionsExtended", {
					ns: "services",
					error: (integrationsError as Error).message,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: errorMessage };
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
			const errorMessage = i18n.t("issueListingConnectionsExtended", {
				ns: "services",
				error,
			});
			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error: new Error(errorMessage).message };
		}
	}
}
