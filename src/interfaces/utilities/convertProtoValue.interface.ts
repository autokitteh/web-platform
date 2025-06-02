import { ValueType } from "@src/types/utilities";

export interface DeepProtoValueResult<T = any> {
	type: ValueType;
	value: T;
}
