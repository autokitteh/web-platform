import { Organization, OrganizationMember } from "@type/models";
import { ServiceResponseError } from "@type/services.types";

export interface OrganizationStore {
	createOrganization: (name: string) => ServiceResponseError;
	organizationsList?: Organization[];
	currentOrganization?: Organization;
	isLoadingOrganizations: boolean;
	isLoadingMembers: boolean;
	getOrganizationsList: () => ServiceResponseError;
	inviteMember: (organizationId: string, email: string) => ServiceResponseError;
	removeMember: (organizationId: string, email: string) => ServiceResponseError;
	listMembers: () => ServiceResponseError;
	membersList?: OrganizationMember[];
	reset: () => void;
	setCurrentOrganization: (organization: Organization) => ServiceResponseError;
}
