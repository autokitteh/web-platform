import { t } from "i18next";

import { EventsService } from "./events.service";
import { connectionsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertConnectionProtoToModel } from "@models/connection.model";
import { LoggerService } from "@services";
import { integrationIcons } from "@src/constants/lists/connections";
import { useCacheStore } from "@src/store";
import { stripGoogleConnectionName } from "@src/utilities";
import { ServiceResponse } from "@type";
import { Connection, Integration } from "@type/models";

export class ConnectionService {
	private static async fetchIntegrations(
		errorMessageKey: string = "intergrationsNotFound",
		errorContext?: Record<string, unknown>
	): Promise<ServiceResponse<Integration[]>> {
		const integrations = await useCacheStore.getState().fetchIntegrations();

		if (!integrations || !integrations.length) {
			const errorMessage = t(errorMessageKey, {
				ns: "services",
				...errorContext,
			});
			LoggerService.error(namespaces.connectionService, errorMessage);

			return {
				data: undefined,
				error: new Error(errorMessage),
			};
		}

		return { data: integrations, error: undefined };
	}
	static async delete(connectionId: string): Promise<ServiceResponse<void>> {
		try {
			await connectionsClient.delete({ connectionId });

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = t("connectionDeleteFailedExtended", {
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
			const { data: event, error: eventError } = await EventsService.getEnriched(eventId);
			if (eventError) {
				const errorMessage = t("coulndtFetchConnectionByEventIdExtended", {
					ns: "services",
					eventId,
					error: eventError,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: eventError };
			}

			if (!event) {
				const errorMessage = t("eventNotFoundForConnectionExtended", {
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
				const errorMessage = t("destinationNotExistOnEvent", {
					ns: "services",
					eventId,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			if (event.destinationType !== "connection") {
				const errorMessage = t("destinationNotConnectionForEvent", {
					ns: "services",
					eventId,
					destinationId: event.destinationId,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			const { data: connection, error } = await ConnectionService.get(event.destinationId);
			if (error) {
				const errorMessage = t("coulndtFetchConnectionByEventIdExtended", {
					ns: "services",
					eventId,
					error,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			return {
				data: connection,
				error: undefined,
			};
		} catch (error) {
			const errorMessage = t("errorGettingConnectionByEventIdExtended", {
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
				const errorMessage = t("connectionNotFound", { ns: "services" });
				LoggerService.error(namespaces.connectionService, errorMessage);

				return { data: undefined, error: new Error(errorMessage) };
			}
			const { data: integrations } = await ConnectionService.fetchIntegrations(
				"intergrationsNotFoundExtendedForConnection",
				{ connectionId }
			);

			const convertedConnection = convertConnectionProtoToModel(connection);
			const integration = integrations?.find(
				(integration) => integration.integrationId === connection.integrationId
			);
			if (!integration) {
				const errorMessage = t("noMatchingIntegrationDetailsForConnection", {
					connectionId,
					connectionName: connection.name,
					ns: "services",
					integrationId: connection.integrationId,
				});
				LoggerService.error(namespaces.connectionService, errorMessage);
			}

			convertedConnection.integrationName = integration?.displayName;
			convertedConnection.integrationUniqueName = integration?.uniqueName;
			const strippedIntegrationName = stripGoogleConnectionName(integration?.uniqueName || "");
			convertedConnection.logo = integrationIcons[strippedIntegrationName];

			return { data: convertedConnection, error: undefined };
		} catch (error) {
			const errorMessage = t("errorGettingConnectionByIdExtended", {
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
			const { data: integrations, error: integrationsError } = await ConnectionService.fetchIntegrations(
				"intergrationsNotFoundExtended",
				{ projectId }
			);

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			const integration = integrations!.find((integration) => integration.uniqueName === integrationName);
			if (!integration) {
				const errorMessage = t("noMatchingIntegrationExtended", {
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
				const error = t("connectionNotCreated", { ns: "services" });
				LoggerService.error(namespaces.connectionService, error);

				return { data: undefined, error: new Error(error) };
			}

			return { data: connectionId, error: undefined };
		} catch (error) {
			const errorMessage = t("connectionNotCreatedExtended", {
				ns: "errors",
				error: (error as Error).message,
			});

			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}

	static async list(projectId: string): Promise<ServiceResponse<Connection[]>> {
		try {
			const { connections } = await connectionsClient.list({ projectId });

			const convertedConnections = connections.map(convertConnectionProtoToModel);
			const { data: integrations, error: integrationsError } = await ConnectionService.fetchIntegrations();

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			convertedConnections.map((connection) => {
				const integration = integrations!.find(
					(integration) => integration.integrationId === connection.integrationId
				);

				if (!integration) {
					const errorMessage = t("noMatchingIntegrationDetailsProjectAndConnection", {
						projectId,
						connectionName: connection.name,
						connectionId: connection.connectionId,
						integrationId: connection.integrationId,
						ns: "services",
					});
					LoggerService.error(namespaces.connectionService, errorMessage);

					return {
						data: undefined,
						error: new Error(errorMessage),
					};
				}

				connection.integrationName = integration.displayName;
				connection.integrationUniqueName = integration.uniqueName;
				const strippedIntegrationName = stripGoogleConnectionName(integration.uniqueName);

				connection.logo = integrationIcons[strippedIntegrationName];
			});

			return { data: convertedConnections, error: undefined };
		} catch (error) {
			const errorMessage = t("issueListingConnectionsExtended", {
				ns: "services",
				error,
			});
			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error: new Error(errorMessage).message };
		}
	}

	static async listGlobalByOrg(orgId: string): Promise<ServiceResponse<Connection[]>> {
		try {
			const { connections } = await connectionsClient.list({ orgId });

			const convertedGlobalConnections = connections
				.filter((connection) => connection.orgId && !connection.projectId)
				.map(convertConnectionProtoToModel);
			const { data: integrations, error: integrationsError } = await ConnectionService.fetchIntegrations();

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			convertedGlobalConnections.map((connection) => {
				const integration = integrations!.find(
					(integration) => integration.integrationId === connection.integrationId
				);

				if (!integration) {
					const errorMessage = t("noMatchingIntegrationDetailsForOrgConnection", {
						orgId,
						connectionName: connection.name,
						connectionId: connection.connectionId,
						integrationId: connection.integrationId,
						ns: "services",
					});
					LoggerService.error(namespaces.connectionService, errorMessage);

					return {
						data: undefined,
						error: new Error(errorMessage),
					};
				}

				connection.integrationName = integration.displayName;
				connection.integrationUniqueName = integration.uniqueName;
				const strippedIntegrationName = stripGoogleConnectionName(integration.uniqueName);

				connection.logo = integrationIcons[strippedIntegrationName];
			});

			return { data: convertedGlobalConnections, error: undefined };
		} catch (error) {
			const errorMessage = t("issueListingOrgConnectionsExtended", {
				ns: "services",
				error,
			});
			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error: new Error(errorMessage).message };
		}
	}

	static async createGlobal(
		orgId: string,
		integrationName: string,
		connectionName: string
	): Promise<ServiceResponse<string>> {
		try {
			const { data: integrations, error: integrationsError } = await ConnectionService.fetchIntegrations(
				"intergrationsForOrgNotFoundExtended",
				{ orgId }
			);

			if (integrationsError) {
				return { data: undefined, error: integrationsError };
			}

			const integration = integrations!.find((integration) => integration.uniqueName === integrationName);
			if (!integration) {
				const errorMessage = t("noMatchingIntegrationExtended", {
					orgId,
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
					orgId,
					name: connectionName,
					integrationId: integration.integrationId,
				},
			});

			if (!connectionId) {
				const error = t("connectionNotCreated", { ns: "services" });
				LoggerService.error(namespaces.connectionService, error);

				return { data: undefined, error: new Error(error) };
			}

			return { data: connectionId, error: undefined };
		} catch (error) {
			const errorMessage = t("connectionNotCreatedExtended", {
				ns: "errors",
				error: (error as Error).message,
			});

			LoggerService.error(namespaces.connectionService, errorMessage);

			return { data: undefined, error: errorMessage };
		}
	}
}
