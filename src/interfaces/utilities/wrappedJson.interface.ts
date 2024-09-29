export interface WrappedJsonObject {
	[key: string]: {
		boolean?: boolean;
		bytes?: Uint8Array;
		dict?: { items: Array<{ k: any; v: any }> };
		duration?: { nanos: number; seconds: number };
		float?: number;
		function?: {
			data: Uint8Array;
			// eslint-disable-next-line @liferay/no-abbreviations
			desc?: any;
			executorId: string;
			flags: string[];
			name: string;
		};
		integer?: bigint;
		list?: { vs: any[] };
		module?: { members: { [key: string]: any }; name: string };
		nothing?: null;
		set?: { vs: any[] };
		string?: string;
		struct?: { ctor: any; fields: { [key: string]: any } };
		symbol?: { name: string };
		time?: { nanos: number; seconds: number };
	};
}
