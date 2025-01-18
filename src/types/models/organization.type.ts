import { MemberRole, MemberStatus } from "@src/enums";

export type Organization = {
	displayName: string;
	id: string;
};
export type OrganizationMember = {
	organizationId: string;
	role: MemberRole;
	status: MemberStatus;
	userId: string;
};

export type OrganizationMemberWithUser = {
	defaultOrganizationId: string;
	email: string;
	id: string;
	name: string;
	organizationId: string;
	role: MemberRole;
	status: MemberStatus;
};

export type OrganizationMemberStatus = {
	id: string;
	organizationId: string;
	userId: string;
};
