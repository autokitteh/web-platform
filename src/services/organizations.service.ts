import i18n from "i18next";

import { organizationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertMemberProtoToModel, convertOrganizationProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Organization, OrganizationMember } from "@type/models";

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

	static async listMembers(organizationId: string): Promise<ServiceResponse<OrganizationMember[]>> {
		try {
			const { members } = await organizationsClient.listMembers({ orgId: organizationId });

			let convertErrors = 0;

			const processedMembers = await Promise.all(
				members.map(async (member) => {
					try {
						return await convertMemberProtoToModel(member);
					} catch (error) {
						LoggerService.error(
							namespaces.organizationsService,
							i18n.t("errorConvertingMemberExtended", {
								memberId: member.userId,
								error: (error as Error).message,
								ns: "services",
							})
						);

						convertErrors++;

						return null;
					}
				})
			).then((results) => results.filter((result) => result !== null));

			if (convertErrors) {
				return { data: undefined, error: new Error(i18n.t("errorConvertingMembers", { ns: "services" })) };
			}

			return { data: processedMembers, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				i18n.t("errorFetchingOrganizationExtended", {
					organizationId,
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
}
