import { MemberStatus } from "@src/enums";
import { User } from "@src/types/models";

export type Organization = {
	displayName: string;
	id: string;
	status?: MemberStatus;
};
export type OrganizationMember = {
	organizationId: string;
	status: MemberStatus;
	user: User;
};
export type OrganizationMemberStatus = {
	id: string;
	organizationId: string;
	userId: string;
};
