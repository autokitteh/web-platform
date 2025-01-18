import i18n from "i18next";

import { organizationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import {
	convertMemberProtoToModel,
	convertMemberProtoToModelWithUser,
	convertOrganizationProtoToModel,
	convertUserProtoToModel,
} from "@models";
import { LoggerService, UsersService } from "@services";
import { MemberStatus, MemberStatusType } from "@src/enums";
import { memberStatusConverter, reverseMemberStatusConverter } from "@src/models/utils";
import { ServiceResponse } from "@type";
import { Organization, OrganizationMember, OrganizationMemberWithUser } from "@type/models";

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

	static async list(userId: string): Promise<
		ServiceResponse<{
			membershipStatuses: Record<string, MemberStatus>;
			organizations: Record<string, Organization>;
		}>
	> {
		try {
			const { orgs, members } = await organizationsClient.getOrgsForUser({ userId });

			const organizations = Object.values(orgs).reduce(
				(acc, org) => {
					acc[org.orgId] = convertOrganizationProtoToModel(org);
					return acc;
				},
				{} as Record<string, Organization>
			);

			const statuses = members.reduce(
				(acc, member) => {
					acc[member.orgId] = memberStatusConverter(member.status);
					return acc;
				},
				{} as Record<string, MemberStatus>
			);

			return { data: { organizations, membershipStatuses: statuses }, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.organizationsService,
				i18n.t("errorFetchingOrganizationExtended", { userId, error: (error as Error).message, ns: "services" })
			);

			return { data: undefined, error };
		}
	}

	static async listMembers(organizationId: string): Promise<
		ServiceResponse<{
			members: Record<string, OrganizationMember>;
			users: Record<string, OrganizationMemberWithUser>;
		}>
	> {
		try {
			const { members } = await organizationsClient.listMembers({ orgId: organizationId });
			const processedMembersArray = members.map(convertMemberProtoToModel);
			const processedMembers = processedMembersArray.reduce(
				(acc, member) => {
					acc[member.userId] = member;
					return acc;
				},
				{} as Record<string, OrganizationMember>
			);

			const processedMembersWithUsers: Record<string, OrganizationMemberWithUser> = {};
			await Promise.all(
				Object.values(processedMembers).map(async (member) => {
					const { data: user } = await UsersService.get({ userId: member.userId });
					if (!user) throw new Error("User not found");
					processedMembersWithUsers[member.userId] = convertMemberProtoToModelWithUser(member, user);
				})
			);

			return { data: { members: processedMembers, users: processedMembersWithUsers }, error: undefined };
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
				error: (error as Error).message,
				ns: "services",
			});

			return { data: undefined, error: toastError };
		}
	}
}
