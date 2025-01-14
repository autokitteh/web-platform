import { MemberRole, MemberStatus } from "@src/enums";
import { User } from "@src/types/models";

export type Organization = {
	displayName: string;
	id: string;
};
export type OrganizationMember = {
	organizationId: string;
	role: MemberRole;
	status: MemberStatus;
	user: User;
};
export type OrganizationMemberStatus = {
	id: string;
	organizationId: string;
	userId: string;
};
