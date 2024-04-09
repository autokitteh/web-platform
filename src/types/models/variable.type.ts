export type TVariable = {
	envId: string;
	name: string;
	value: string;
	isSecret: boolean;
};

export type TVariableDelete = {
	envId: string;
	name: string;
};
