import { ServiceResponse, ServiceResponseError } from "@src/types";
import { Organization, OrganizationMember } from "@type/models";

export interface OrganizationStore {
	organizationsList?: Organization[];
	currentOrganization?: Organization;
	isLoadingOrganizations: boolean;
	isLoadingMembers: boolean;
	membersList?: OrganizationMember[];
	reset: () => void;
	getOrganizationsList: () => ServiceResponse<Organization[]>;
	createOrganization: (name: string) => ServiceResponse<string>;
	setCurrentOrganization: (organization: Organization) => void;
	inviteMember: (email: string) => ServiceResponseError;
	removeMember: (userId: string) => ServiceResponseError;
	listMembers: () => void;
}
