export type WrappedJsonValue = Partial<{
	boolean: boolean;
	bytes: Uint8Array;
	dict: { items: Array<{ k: any; v: any }> };
	duration: { nanos: number; seconds: number };
	float: number;
	function: {
		data: Uint8Array;

		desc?: any;
		executorId: string;
		flags: string[];
		name: string;
	};
	integer: bigint;
	list: { vs: any[] };
	module: { members: Record<string, any>; name: string };
	nothing: null | undefined;
	set: { vs: any[] };
	string: string;
	struct: { ctor: any; fields: Record<string, any> };
	symbol: { name: string };
	time: { nanos: number; seconds: number };
}>;

export type Value = Record<string, WrappedJsonValue>;

export const isWrappedJsonValueWithBytes = (value: WrappedJsonValue): value is { bytes: Uint8Array } => {
	return "bytes" in value && value.bytes instanceof Uint8Array;
};

export const isWrappedJsonValueWithString = (value: WrappedJsonValue): value is { string: string } => {
	return "string" in value && typeof value.string === "string";
};
