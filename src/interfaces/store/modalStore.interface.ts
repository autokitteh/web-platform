export interface IModalStore {
	modals: {
		[key: string]: boolean;
	};
	itemId?: string;
	openModal: (name: string, id?: string) => void;
	closeModal: (name: string) => void;
}
