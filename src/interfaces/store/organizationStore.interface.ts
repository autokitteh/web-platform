import { MemberStatus } from "@src/enums";
import { ServiceResponse, ServiceResponseError } from "@src/types";
import { Organization, OrganizationMember, OrganizationMemberWithUser, User } from "@type/models";

export interface OrganizationStore {
	organizationsList?: Record<string, Organization>;
	organizationsStatuses?: Record<string, MemberStatus>;
	currentOrganization?: Organization;
	isLoadingOrganizations: boolean;
	isLoadingMembers: boolean;
	inviteMember: (email: string) => ServiceResponseError;
	deleteMember: (userId: string) => ServiceResponseError;
	membersList?: Record<string, OrganizationMember>;
	membersListWithUsers?: Record<string, OrganizationMemberWithUser>;
	usersList?: User[];
	reset: () => void;
	getOrganizationsList: () => ServiceResponse<{
		membershipStatuses: Record<string, MemberStatus>;
		organizations: Record<string, Organization>;
	}>;
	createOrganization: (name: string) => ServiceResponse<string>;
	setCurrentOrganization: (organization: Organization) => ServiceResponseError;
	listMembers: () => ServiceResponseError;
}
