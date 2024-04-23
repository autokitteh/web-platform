import { Variable } from "@type/models";

export interface ModalProps {
	className?: string;
	children: React.ReactNode;
	name: string;
}

export interface ModalAddCodeAssetsProps {
	onError: (message: string) => void;
}

export interface ModalDeleteTriggerProps {
	onDelete?: () => void;
}

export interface ModalDeleteVariableProps {
	onDelete?: () => void;
	variable: Variable | undefined;
}

export interface ModalModifyVariableProps {
	onError: (message: string) => void;
}

export interface DeleteFile {
	onDelete?: () => void;
}
