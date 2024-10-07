import { Variable } from "@type/models";

export interface ModalProps {
	children: React.ReactNode;
	className?: string;
	name: string;
	hideCloseButton?: boolean;
}

export interface ModalAddCodeAssetsProps {
	onSuccess: () => void;
}

export interface ModalDeleteTriggerProps {
	onDelete?: () => void;
	triggerId?: string;
}

export interface ModalDeleteVariableProps {
	onDelete?: () => void;
	variable?: Variable;
}

export interface ModalModifyVariableProps {
	onError: (message: string) => void;
}

export interface DeleteFile {
	onDelete?: () => void;
}

export interface DeleteAccount {
	onDelete?: () => void;
}

export interface ModalDeleteDeploymentProps {
	onDelete?: () => void;
	deploymentId?: string;
}

export interface ModalDeleteDeploymentSessionProps {
	onDelete?: () => void;
}

export interface ModalDeleteConnectionProps {
	connectionId: string;
	onDelete: () => void;
}
