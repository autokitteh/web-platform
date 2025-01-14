import { ServiceResponse, ServiceResponseError } from "@src/types";
import { Organization, OrganizationMember } from "@type/models";

export interface OrganizationStore {
	organizationsList?: Organization[];
	currentOrganization?: Organization;
	isLoadingOrganizations: boolean;
	isLoadingMembers: boolean;
	inviteMember: (email: string) => ServiceResponseError;
	deleteMember: (userId: string) => ServiceResponseError;
	membersList?: OrganizationMember[];
	reset: () => void;
	getOrganizationsList: () => ServiceResponse<Organization[]>;
	createOrganization: (name: string) => ServiceResponse<string>;
	setCurrentOrganization: (organization: Organization) => ServiceResponseError;
	removeMember: (organizationId: string, email: string) => ServiceResponseError;
	listMembers: () => ServiceResponseError;
}
