import i18n from "i18next";

import { Org as ProtoOrganization, OrgMember as ProtoOrganizationMember } from "@ak-proto-ts/orgs/v1/org_pb";
import { memberStatusConverter } from "@models/utils";
import { UsersService } from "@services";
import { MemberRole } from "@src/enums";
import { Organization, OrganizationMember } from "@type/models";

export const convertOrganizationProtoToModel = (protoOrganization: ProtoOrganization): Organization => {
	return {
		displayName: protoOrganization.displayName,
		id: protoOrganization.orgId,
	};
};

export const convertMemberProtoToModel = async (
	protoOrganizationMember: ProtoOrganizationMember
): Promise<OrganizationMember> => {
	const { data: user, error } = await UsersService.get({ userId: protoOrganizationMember.userId });
	if (error) {
		throw error;
	}
	if (!user) {
		throw new Error(
			i18n.t("userNotFound", {
				ns: "services",
			})
		);
	}

	const role = protoOrganizationMember.roles.includes("admin") ? MemberRole.admin : MemberRole.user;

	return {
		user,
		organizationId: protoOrganizationMember.orgId,
		status: memberStatusConverter(protoOrganizationMember.status),
		role,
	};
};
