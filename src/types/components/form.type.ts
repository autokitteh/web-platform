export type FormMode = "create" | "edit";

export type ManualFormParamsErrors = {
	jsonParams?: { message: string };
	params?: {
		key?: { message: string };
		value?: { message: string };
	}[];
};
