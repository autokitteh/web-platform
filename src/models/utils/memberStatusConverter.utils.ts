import { OrgMemberStatus as ProtoOrgMemberStatus } from "@ak-proto-ts/orgs/v1/org_pb";
import { MemberStatus } from "@enums";
import { MemberStatusKeyType } from "@src/interfaces/models";

export const memberStatusConverter = (protoMemberStatus: ProtoOrgMemberStatus): MemberStatus => {
	const memberStatus = ProtoOrgMemberStatus[protoMemberStatus].toLowerCase();

	return MemberStatus[memberStatus as MemberStatusKeyType];
};

export const reverseMemberStatusConverter = (memberStatus?: MemberStatusKeyType): number | undefined => {
	if (!memberStatus) {
		return;
	}
	if (!(memberStatus in MemberStatus)) {
		return;
	}
	const protoMemberStatus = ProtoOrgMemberStatus[memberStatus.toUpperCase() as keyof typeof ProtoOrgMemberStatus];

	return protoMemberStatus;
};
