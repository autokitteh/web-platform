import { Org as ProtoOrganization } from "@ak-proto-ts/orgs/v1/org_pb";
import { Organization } from "@type/models";

export const convertOrganizationProtoToModel = (protoOrganization: ProtoOrganization): Organization => {
	return {
		displayName: protoOrganization.displayName,
		id: protoOrganization.orgId,
	};
};
