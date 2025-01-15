import { MemberRole, MemberStatusType } from "@src/enums";

export type Organization = Readonly<{
	displayName: string;
	id: string;
	uniqueName: string;
}>;
export type OrganizationMember = Readonly<{
	role: MemberRole;
	status?: MemberStatusType;
	userId: string;
}>;

export type User = Readonly<{
	defaultOrganizationId: string;
	email: string;
	id: string;
	name: string;
}>;

export type EnrichedMember = Readonly<Omit<OrganizationMember, "userId"> & User>;

export type CurrentMemberInfo = Readonly<{
	role: MemberRole;
	status: MemberStatusType;
}>;

export type EnrichedOrganization = Readonly<
	Organization & {
		currentMember?: CurrentMemberInfo;
	}
>;
