import { OrgMemberStatus as ProtoOrgMemberStatus } from "@ak-proto-ts/orgs/v1/org_pb";
import { MemberStatus, MemberStatusType } from "@enums";
import { MemberStatusKeyType } from "@src/interfaces/models";

export const memberStatusConverter = (protoMemberStatus?: ProtoOrgMemberStatus): MemberStatusType => {
	if (!protoMemberStatus) return MemberStatusType.unspecified;

	const memberStatus = ProtoOrgMemberStatus[protoMemberStatus].toLowerCase();

	return MemberStatusType[memberStatus as MemberStatusKeyType];
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
