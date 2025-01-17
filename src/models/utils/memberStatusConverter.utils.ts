import { OrgMemberStatus as ProtoOrgMemberStatus } from "@ak-proto-ts/orgs/v1/org_pb";
import { MemberStatusType } from "@enums";
import { MemberStatusKeyType } from "@src/interfaces/models";

export const memberStatusConverter = (protoMemberStatus?: ProtoOrgMemberStatus): MemberStatusType => {
	if (!protoMemberStatus) return MemberStatusType.unspecified;

	const memberStatusType = ProtoOrgMemberStatus[protoMemberStatus].toLowerCase();

	return MemberStatusType[memberStatusType as MemberStatusKeyType];
};

export const reverseMemberStatusConverter = (memberStatus?: MemberStatusType): number | undefined => {
	if (!memberStatus) {
		return;
	}
	if (!(memberStatus in MemberStatusType)) {
		return;
	}
	const protoMemberStatus = ProtoOrgMemberStatus[memberStatus.toUpperCase() as keyof typeof ProtoOrgMemberStatus];

	return protoMemberStatus;
};
