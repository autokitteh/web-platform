import i18n from "i18next";

import { organizationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertOrganizationProtoToModel } from "@models/organization.model";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Organization } from "@type/models";

export class OrganizationsService {
	static async create(displayName: string): Promise<ServiceResponse<string>> {
		try {
			const { orgId } = await organizationsClient.create({ org: { displayName } });

			return { data: orgId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				i18n.t("organizationNotCreatedExtended", {
					error: (error as Error).message,
					ns: "services",
					name: displayName,
				})
			);

			return { data: undefined, error };
		}
	}

	static async list(userId: string): Promise<ServiceResponse<Organization[]>> {
		try {
			const { orgs } = await organizationsClient.getOrgsForUser({ userId });

			const processedOrganizations = Object.values(orgs).map(convertOrganizationProtoToModel);

			return { data: processedOrganizations, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				i18n.t("errorFetchingOrganizationExtended", { userId, error: (error as Error).message, ns: "services" })
			);

			return { data: undefined, error };
		}
	}
}
