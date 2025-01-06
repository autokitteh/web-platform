import i18n from "i18next";

import { organizationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertOrganizationProtoToModel } from "@models/organization.model";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Organization } from "@type/models";

export class OrganizationsService {
	static async create(name: string): Promise<ServiceResponse<string>> {
		try {
			const { orgId } = await organizationsClient.create({ org: { displayName: "test" } });

			return { data: orgId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				i18n.t("triggerNotCreatedExtended", { error: (error as Error).message, ns: "services", name })
			);

			return { data: undefined, error };
		}
	}

	static async list(userId: string): Promise<ServiceResponse<Organization[]>> {
		try {
			const { orgs } = await organizationsClient.getOrgsForUser({ userId });

			const organizations = await Promise.allSettled(
				orgs.map(async ({ orgId }) => {
					const { org } = await organizationsClient.get({ orgId });

					return org ? convertOrganizationProtoToModel(org) : undefined;
				})
			);

			const hasErrors = organizations.some((result) => result.status === "rejected");
			if (hasErrors) {
				throw new Error(`Some organization retrievals failed for userId: ${userId}`);
			}

			const filteredOrganizations = organizations
				.filter(
					(result): result is PromiseFulfilledResult<Organization | undefined> =>
						result.status === "fulfilled"
				)
				.map((result) => result.value)
				.filter((org): org is Organization => org !== undefined);

			return { data: filteredOrganizations, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				i18n.t("errorFetchingVariables", { userId, error, ns: "errors" })
			);

			return { data: undefined, error };
		}
	}
}
