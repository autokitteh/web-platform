import { t } from "i18next";

import { organizationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import {
	convertMemberProtoToModel,
	convertOrganizationModelToProto,
	convertOrganizationProtoToModel,
	convertUserProtoToModel,
} from "@models";
import { LoggerService } from "@services";
import { MemberStatusType } from "@src/enums";
import { reverseMemberStatusConverter } from "@src/models/utils";
import { ServiceResponse } from "@type";
import { Organization, OrganizationMember, User } from "@type/models";

export class OrganizationsService {
	static async create(displayName: string): Promise<ServiceResponse<string>> {
		try {
			const { orgId } = await organizationsClient.create({ org: { displayName } });

			return { data: orgId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				t("organizationNotCreatedExtended", {
					error: (error as Error).message,
					ns: "services",
					name: displayName,
				})
			);

			return { data: undefined, error };
		}
	}

	static async update(organization: Organization, fieldMask: string[]): Promise<ServiceResponse<void>> {
		try {
			await organizationsClient.update({
				org: convertOrganizationModelToProto(organization),
				fieldMask: { paths: fieldMask },
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			const logError = t("organizationNotUpdatedExtended", {
				error: (error as Error).message,
				ns: "services",
				name: organization?.displayName,
				id: organization?.id,
			});
			LoggerService.error(namespaces.organizationsService, logError);
			const toastErrorr = t("organizationNotUpdated", {
				ns: "services",
			});
			return { data: undefined, error: toastErrorr };
		}
	}

	static async get(organizationId: string): Promise<ServiceResponse<Organization>> {
		try {
			const { org } = await organizationsClient.get({ orgId: organizationId });
			if (!org) {
				const errorMessage = t("organizationCouldntFetch", { organizationId, ns: "services" });
				LoggerService.error(namespaces.sessionsService, errorMessage);

				return { data: undefined, error: new Error(errorMessage) };
			}

			const organization = convertOrganizationProtoToModel(org);
			return { data: organization, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				t("organizationNotGetExtended", {
					error: (error as Error).message,
					organizationId,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
	static async delete(organization: Organization): Promise<ServiceResponse<void>> {
		try {
			await organizationsClient.delete({ orgId: organization.id });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				t("organizationDeleteFailedExtended", {
					error: (error as Error).message,
					ns: "services",
					id: organization.id,
					name: organization.displayName,
				})
			);

			return { data: undefined, error };
		}
	}

	static async list(userId: string): Promise<
		ServiceResponse<{
			members: Record<string, Record<string, OrganizationMember>>;
			organizations: Record<string, Organization>;
		}>
	> {
		try {
			const { orgs, members } = await organizationsClient.getOrgsForUser({ userId });

			const normalizedOrganizations = Object.values(orgs).reduce(
				(acc, org) => {
					acc[org.orgId] = convertOrganizationProtoToModel(org);
					return acc;
				},
				{} as Record<string, Organization>
			);
			const normalizedMembers = members.reduce(
				(acc, member) => {
					if (!acc[member.orgId]) {
						acc[member.orgId] = {};
					}
					acc[member.orgId][member.userId] = convertMemberProtoToModel(member);
					return acc;
				},
				{} as Record<string, Record<string, OrganizationMember>>
			);

			return { data: { organizations: normalizedOrganizations, members: normalizedMembers }, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				t("errorFetchingOrganizationExtended", { userId, error: (error as Error).message, ns: "services" })
			);

			return { data: undefined, error };
		}
	}

	static async listMembers(organizationId: string): Promise<
		ServiceResponse<{
			members: Record<string, Record<string, OrganizationMember>>;
			users: Record<string, User>;
		}>
	> {
		try {
			const { users, members } = await organizationsClient.listMembers({ orgId: organizationId });

			const normalizedMembers = members.reduce(
				(acc, member) => {
					if (!acc[member.orgId]) {
						acc[member.orgId] = {};
					}
					acc[member.orgId][member.userId] = convertMemberProtoToModel(member);
					return acc;
				},
				{} as Record<string, Record<string, OrganizationMember>>
			);

			const normalizedUsers = users.reduce(
				(acc, user) => ({
					...acc,
					[user.userId]: convertUserProtoToModel(user),
				}),
				{}
			);

			return {
				data: {
					members: normalizedMembers,
					users: normalizedUsers,
				},
				error: undefined,
			};
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				t("errorFetchingOrganizationExtended", {
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
			const logError = t("errorInvitingUserToOrganizationExtended", {
				organizationId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.organizationsService, logError);

			return { data: undefined, error: logError };
		}
	}

	static async updateMemberStatus(
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
				fieldMask: { paths: ["status"] },
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			const logError = t("errorUpdatingUserToOrganizationExtended", {
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
			const logError = t("errorRemovingUserToOrganizationExtended", {
				organizationId,
				error: (error as Error).message,
				ns: "services",
			});
			LoggerService.error(namespaces.organizationsService, logError);

			const toastError = t("errorRemovingUserToOrganization", {
				error: (error as Error).message,
				ns: "services",
			});

			return { data: undefined, error: toastError };
		}
	}
}
