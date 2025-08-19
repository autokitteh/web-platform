import { ToasterTypes } from "@src/types/components";

export type StoreCallbacks = {
	addToast: (toast: { message: string; type: ToasterTypes }) => void;
	checkState: (projectId: string, data: { resources: any }) => void;
	closeOpenedFile?: (name: string) => void;
	setFileList: (data: { isLoading: boolean; list?: string[] }) => void;
};
