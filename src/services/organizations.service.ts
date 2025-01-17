import i18n from "i18next";

import { organizationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertMemberProtoToModel, convertOrganizationProtoToModel } from "@models";
import { LoggerService } from "@services";
import { MemberStatusType } from "@src/enums";
import { memberStatusConverter, reverseMemberStatusConverter } from "@src/models/utils";
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

	static async get(organizationId: string): Promise<ServiceResponse<Organization>> {
		try {
			const { org } = await organizationsClient.get({ orgId: organizationId });
			if (!org) {
				const errorMessage = i18n.t("organizationCouldntFetch", { organizationId, ns: "services" });
				LoggerService.error(namespaces.sessionsService, errorMessage);

				return { data: undefined, error: new Error(errorMessage) };
			}

			const organization = convertOrganizationProtoToModel(org);
			return { data: organization, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				i18n.t("organizationNotGetExtended", {
					error: (error as Error).message,
					organizationId,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}

	static async list(userId: string): Promise<ServiceResponse<Organization[]>> {
		try {
			const { orgs, members } = await organizationsClient.getOrgsForUser({ userId, includeOrgs: true });

			const processOrganization = (org: any) => {
				const organization = convertOrganizationProtoToModel(org);
				const status = members.find((m) => m.orgId === organization.id)?.status;
				return { ...organization, status: status ? memberStatusConverter(status) : undefined };
			};

			const processedOrganizations = Object.values(orgs).map(processOrganization);

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

	static async inviteMember(organizationId: string, userId: string): Promise<ServiceResponse<void>> {
		try {
			await organizationsClient.addMember({
				member: {
					orgId: organizationId,
					userId,
					status: reverseMemberStatusConverter(MemberStatusType.invited),
				},
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			const logError = i18n.t("errorInvitingUserToOrganizationExtended", {
				organizationId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.organizationsService, logError);

			return { data: undefined, error: logError };
		}
	}

	static async updateMember(
		organizationId: string,
		userId: string,
		status: MemberStatusType
	): Promise<ServiceResponse<void>> {
		try {
			await organizationsClient.updateMember({
				member: {
					orgId: organizationId,
					userId,
					status: reverseMemberStatusConverter(status),
				},
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			const logError = i18n.t("errorUpdatingUserToOrganizationExtended", {
				organizationId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.organizationsService, logError);

			return { data: undefined, error: new Error(logError) };
		}
	}

	static async deleteMember(organizationId: string, userId: string): Promise<ServiceResponse<void>> {
		try {
			await organizationsClient.removeMember({
				orgId: organizationId,
				userId,
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			const logError = i18n.t("errorRemovingUserToOrganizationExtended", {
				organizationId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.organizationsService, logError);

			const toastError = i18n.t("errorRemovingUserToOrganization", {
				organizationId,
				error: (error as Error).message,
				ns: "services",
			});

			return { data: undefined, error: toastError };
		}
	}
}
