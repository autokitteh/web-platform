import { Organization } from "@type/models";
import { ServiceResponseError } from "@type/services.types";

export interface OrganizationStore {
	createOrganization: (name: string) => ServiceResponseError;
	organizationsList?: Organization[];
	currentOrganizationId?: string;
	isLoadingOrganizations: boolean;
	getOrganizationsList: () => ServiceResponseError;
	inviteMember: (organizationId: string, email: string) => ServiceResponseError;
	setCurrentOrganizationId: (organizationId: string) => void;
}
