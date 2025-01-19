import { Org as ProtoOrganization, OrgMember as ProtoOrganizationMember } from "@ak-proto-ts/orgs/v1/org_pb";
import { memberStatusConverter } from "@models/utils";
import { MemberRole } from "@src/enums";
import { Organization, OrganizationMember, EnrichedMember, User } from "@type/models";

export const convertOrganizationProtoToModel = (protoOrganization: ProtoOrganization): Organization => {
	return {
		displayName: protoOrganization.displayName,
		id: protoOrganization.orgId,
	};
};

export const convertMemberProtoToModel = (protoOrganizationMember: ProtoOrganizationMember): OrganizationMember => {
	let role: MemberRole;
	if (protoOrganizationMember.roles.includes("admin")) role = MemberRole.admin;
	else if (protoOrganizationMember.roles.length === 0) role = MemberRole.user;
	else role = MemberRole.unspecified;

	return {
		status: memberStatusConverter(protoOrganizationMember.status),
		role,
		userId: protoOrganizationMember.userId,
	};
};

export const convertMemberProtoToModelWithUser = (member: OrganizationMember, user: User): EnrichedMember => {
	return {
		...member,
		...user,
	};
};
