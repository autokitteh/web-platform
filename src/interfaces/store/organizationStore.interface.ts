import { Organization, OrganizationMember } from "@type/models";
import { ServiceResponse } from "@src/types";
import { ServiceResponseError } from "@type/services.types";

export interface OrganizationStore {
	organizationsList?: Organization[];
	currentOrganization?: Organization;
	isLoadingOrganizations: boolean;
	isLoadingMembers: boolean;
	membersList?: OrganizationMember[];
	reset: () => void;
	getOrganizationsList: () => ServiceResponse<Organization[]>;
	createOrganization: (name: string) => ServiceResponseError;
	setCurrentOrganization: (organization: Organization) => ServiceResponseError;
	inviteMember: (organizationId: string, email: string) => ServiceResponseError;
	removeMember: (organizationId: string, email: string) => ServiceResponseError;
	listMembers: () => ServiceResponseError;
}
