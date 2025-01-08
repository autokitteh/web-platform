import i18n from "i18next";

import { memberStatusConverter } from "./utils";
import { Org as ProtoOrganization, OrgMember as ProtoOrganizationMember } from "@ak-proto-ts/orgs/v1/org_pb";
import { UsersService } from "@services/users.service";
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
	const { data: user, error } = await UsersService.get(protoOrganizationMember.userId);
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

	return {
		user,
		organizationId: protoOrganizationMember.orgId,
		status: memberStatusConverter(protoOrganizationMember.status),
	};
};
