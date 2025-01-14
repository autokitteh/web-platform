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
	setCurrentOrganization: (organization: Organization) => ServiceResponseError;
	inviteMember: (organizationId: string, email: string) => ServiceResponseError;
	removeMember: (organizationId: string, email: string) => ServiceResponseError;
	listMembers: () => ServiceResponseError;
}
