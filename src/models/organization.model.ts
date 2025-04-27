import { Organization, OrganizationMember } from "@types/models";

import { Org as ProtoOrganization, OrgMember as ProtoOrganizationMember } from "@ak-proto-ts/orgs/v1/org_pb";
import { MemberRole } from "@enums";
import { memberStatusConverter } from "@models/utils";

export const convertOrganizationProtoToModel = (protoOrganization: ProtoOrganization): Organization => {
	return {
		displayName: protoOrganization.displayName,
		id: protoOrganization.orgId,
		uniqueName: protoOrganization.name,
	};
};
export const convertOrganizationModelToProto = (organization: Organization): Partial<ProtoOrganization> => {
	return {
		displayName: organization.displayName,
		orgId: organization.id,
		name: organization.uniqueName,
	};
};

const determineRole = (roles: string[]): MemberRole => {
	if (roles.includes("admin")) return MemberRole.admin;
	if (roles.length === 0) return MemberRole.user;
	return MemberRole.unspecified;
};

export const convertMemberProtoToModel = (protoOrganizationMember: ProtoOrganizationMember): OrganizationMember => {
	return {
		status: memberStatusConverter(protoOrganizationMember.status),
		role: determineRole(protoOrganizationMember.roles),
		userId: protoOrganizationMember.userId,
	};
};
