import { connectionsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertConnectionProtoToModel } from "@models/connection.model";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Connection } from "@type/models";
import i18n from "i18next";

export class ConnectionService {
	static async get(connectionId: string): Promise<ServiceResponse<Connection>> {
		try {
			const { connection } = await connectionsClient.get({ connectionId });
			if (!connection) {
				LoggerService.error(namespaces.triggerService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: i18n.t("connectionNotFound", { ns: "services" }) };
			}
			return { data: convertConnectionProtoToModel(connection), error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.connectionService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Connection[]>> {
		try {
			const { connections } = await connectionsClient.list({ projectId });
			if (!connections) {
				LoggerService.error(namespaces.triggerService, i18n.t("connectionNotFound", { ns: "services" }));

				return { data: undefined, error: i18n.t("connectionNotFound", { ns: "services" }) };
			}

			const convertedConnections = connections.map((connection) => convertConnectionProtoToModel(connection));
			return { data: convertedConnections, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

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
}
