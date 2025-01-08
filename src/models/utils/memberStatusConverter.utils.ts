import { OrgMemberStatus as ProtoOrgMemberStatus } from "@ak-proto-ts/orgs/v1/org_pb";
import { MemberStatus } from "@enums";
import { MemberStatusKeyType } from "@src/interfaces/models";

export const memberStatusConverter = (protoMemberStatus: ProtoOrgMemberStatus): MemberStatus => {
	if (!(protoMemberStatus in ProtoOrgMemberStatus)) {
		return MemberStatus.unspecified;
	}
	const memberStatus = ProtoOrgMemberStatus[protoMemberStatus].toLowerCase();

	return MemberStatus[memberStatus as MemberStatusKeyType];
};
