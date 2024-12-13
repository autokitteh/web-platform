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

export interface DeleteAccount {
	onDelete?: () => void;
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
