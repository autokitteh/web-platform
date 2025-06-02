export interface ConvertValueOptions {
	includeTypeInfo?: boolean;
	formatForDisplay?: boolean;
}

export interface FormattedValueResult {
	stringValue: string;
	jsonValue: any;
}
