import { TemplateMetadata } from "@interfaces/store";
import { Variable } from "@type/models";

export interface ModalProps {
	children: React.ReactNode;
	className?: string;
	name: string;
	hideCloseButton?: boolean;
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

export interface RemoveMemberModalProps {
	onRemove: (userId: string, email: string) => void;
	isRemoving: boolean;
}
export interface DeleteOrganizationModalProps {
	onDelete: (id: string, name: string) => void;
	isDeleting: boolean;
}

export interface DeleteAccountModalProps {
	onDelete: () => void;
}

export interface CreateProjectModalProps {
	category?: string;
	cardTemplate: TemplateMetadata;
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
