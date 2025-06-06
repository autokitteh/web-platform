import { ModalName } from "@enums/components";
import { ModalData, OpenModalFn } from "@src/types/modals.types";

export interface ModalStore {
	closeAllModals: () => void;
	closeModal: (name: string) => void;
	data?: any; // Keep as any for backward compatibility during transition
	modals: {
		[key: string]: boolean;
	};
	// Type-safe modal opening
	openModal: OpenModalFn;
	// Legacy method for backward compatibility
	openModalLegacy: (name: string, data?: any) => void;

	// Type-safe data getter
	getModalData: <T extends ModalName>(name: T) => ModalData<T> | undefined;
}
