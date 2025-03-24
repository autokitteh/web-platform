import { TemplateMetadata } from "@interfaces/store";
import { EnrichedOrganization, Variable } from "@type/models";

export interface ModalProps {
	children: React.ReactNode;
	className?: string;
	name: string;
	hideCloseButton?: boolean;
	wrapperClass?: string;
	hideBg?: boolean;
}
export interface DeleteModalProps {
	onDelete: () => void;
	id?: string;
	isDeleting: boolean;
}

export interface ModalDeleteVariableProps {
	onDelete?: () => void;
	variable?: Variable;
	isDeleting?: boolean;
}

export interface ModalModifyVariableProps {
	onError: (message: string) => void;
}

export interface DeleteMemberModalProps {
	onDelete: (userId: string, email: string) => void;
	isDeleting: boolean;
}
export interface DeleteOrganizationModalProps {
	onDelete: (organization: EnrichedOrganization) => void;
	isDeleting: boolean;
}

export interface DeleteAccountModalProps {
	onDelete: () => void;
}

export interface CreateProjectModalProps {
	template: TemplateMetadata;
	readme: string;
	isReadmeLoading: boolean;
	isCreating: boolean;
	projectNamesList: string[];
	onSubmit: (projectName: string) => Promise<void>;
	onCancel: () => void;
}
export interface ProjectTemplateCreateContainerProps {
	template: TemplateMetadata;
	category?: string;
}

export interface ActiveDeploymentWarningModalProps {
	goToEdit: (modifiedId: string) => void;
	goToAdd: () => void;
	modifiedId: string;
	action?: "add" | "edit";
}

export interface CreateMemberModalProps {
	createMember: (email: string) => void;
	isCreating: boolean;
	membersEmails: Set<string>;
}

export interface CreateMemberModalRef {
	resetForm: () => void;
}
