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

			const organizations = await Promise.allSettled(
				orgs.map(async ({ orgId }) => {
					const { org } = await organizationsClient.get({ orgId });

					return org ? convertOrganizationProtoToModel(org) : undefined;
				})
			);

			const hasErrors = organizations.some((result) => result.status === "rejected");
			if (hasErrors) {
				throw new Error(
					i18n.t("someOrganizationRetrievalFailed", {
						ns: "services",
					})
				);
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
				namespaces.organizationsService,
				i18n.t("errorFetchingOrganizationExtended", { userId, error: (error as Error).message, ns: "services" })
			);

			return { data: undefined, error };
		}
	}
}
