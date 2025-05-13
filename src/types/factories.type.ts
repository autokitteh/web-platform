import { ToastType } from "@src/types/components";

export type StoreCallbacks = {
	addToast: (toast: { message: string; type: ToastType }) => void;
	checkState: (projectId: string, data: { resources: any }) => void;
	closeOpenedFile?: (name: string) => void;
	setFileList: (data: { isLoading: boolean; list?: string[] }) => void;
};
