import { ServiceResponse, ServiceResponseError } from "@src/types";
import { Organization, OrganizationMember } from "@type/models";

export interface OrganizationStore {
	organizationsList?: Organization[];
	currentOrganization?: Organization;
	isLoadingOrganizations: boolean;
	isLoadingMembers: boolean;
	membersList?: OrganizationMember[];
	reset: () => void;
	getOrganizationsList: () => Promise<undefined>;
	createOrganization: (name: string) => ServiceResponse<string>;
	setCurrentOrganization: (organization: Organization) => ServiceResponseError;
	inviteMember: (email: string) => ServiceResponseError;
	removeMember: (organizationId: string, email: string) => ServiceResponseError;
	listMembers: () => void;
	setOrganizationsList: (organizations: Organization[]) => void;
	deleteOrganization: (organizationId: string) => ServiceResponseError;
}
