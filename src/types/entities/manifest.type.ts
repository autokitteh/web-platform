export type ApplyResponse = {
	error?: string;
	stage?: string;
	logs?: { msg: string; data: any }[];
	operations?: { description: string }[];
};
