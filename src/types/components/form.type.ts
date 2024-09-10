export type FormMode = "create" | "edit";

export type ManualFormParamsErrors = {
	params?: {
		key?: { message: string };
		value?: { message: string };
	}[];
};
