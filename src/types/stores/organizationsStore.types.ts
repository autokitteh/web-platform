import { MemberStatusType, UserStatusType } from "@src/enums";
import { ServiceResponse } from "@src/types";
import { EnrichedOrganization, Organization, OrganizationMember, EnrichedMember, User } from "@type/models";
import { StoreResponse } from "@type/stores";

export type OrganizationStoreState = Readonly<{
	currentOrganization?: Organization;
	isLoading: {
		deleteMember: boolean;
		deletingOrganization: boolean;
		inviteMember: boolean;
		members: boolean;
		organizations: boolean;
<<<<<<< HEAD
		updateMember: boolean;
		updatingOrganization: boolean;
		updatingUser: boolean;
<<<<<<< HEAD
=======
		updatingOrganization: boolean;
>>>>>>> 8769c279 (feat(UI-1191): organizations settings - name update)
=======
>>>>>>> 003df3f2 (feat(UI-1208): allow users rename their display-name)
	};
	logoutFunction: (redirectToLogin: boolean) => void;
	members: Record<string, Record<string, OrganizationMember>>;
	organizations: Record<string, Organization>;
	user?: User;
	users: Record<string, User>;
}>;

export type OrganizationStoreSelectors = {
	getCurrentOrganizationEnriched: () => StoreResponse<EnrichedOrganization>;
	getEnrichedMembers: () => StoreResponse<EnrichedMember[]>;
	getEnrichedOrganizations: () => StoreResponse<EnrichedOrganization[]>;
};

export type OrganizationStoreActions = {
	createOrganization: (name: string) => ServiceResponse<string>;
	createUser: (email: string, status: UserStatusType) => ServiceResponse<string>;
	deleteMember: (userId: string) => ServiceResponse<void>;
	deleteOrganization: (organization: Organization) => ServiceResponse<void>;
	getMembers: () => ServiceResponse<void>;
	getOrganizations: () => ServiceResponse<void>;
	inviteMember: (email: string) => ServiceResponse<void>;
	login: () => ServiceResponse<User>;
	reset: () => void;
	setCurrentOrganization: (organization: Organization) => void;
	setLogoutFunction: (logoutFn: (redirectToLogin: boolean) => void) => void;
	updateMemberStatus: (organizationId: string, status: MemberStatusType) => ServiceResponse<void>;
	updateOrganization: (organization: Organization) => ServiceResponse<void>;
	updateUserName: (user: User) => ServiceResponse<void>;
};

export type OrganizationStore = OrganizationStoreState & OrganizationStoreSelectors & OrganizationStoreActions;
