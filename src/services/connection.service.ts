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
				LoggerService.error(namespaces.triggerService, i18n.t("errors.connectionNotFound", { connectionId }));

				return { data: undefined, error: i18n.t("errors.connectionNotFound", { connectionId }) };
			}
			return { data: convertConnectionProtoToModel(connection), error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}
