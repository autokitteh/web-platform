import { Variable } from "@type/models";

export interface ModalProps {
	className?: string;
	children: React.ReactNode;
	name: string;
}

export interface ModalAddCodeAssetsProps {
	onError: (message: string) => void;
	onSuccess: () => void;
}

export interface ModalDeleteTriggerProps {
	triggerId?: string;
	onDelete?: () => void;
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

export interface ModalDeleteDeploymentProps {
	onDelete?: () => void;
}

export interface ModalDeleteDeploymentSessionProps {
	onDelete?: () => void;
}

export interface ModalDeleteConnectionProps {
	connectionId: string;
	loading: boolean;
	onDelete: () => void;
}
