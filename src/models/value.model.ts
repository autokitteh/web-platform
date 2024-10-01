import { Value as ProtoValue } from "@src/autokitteh/proto/gen/ts/autokitteh/values/v1/values_pb";
import { Value } from "@src/types/models";

export const convertValue = (value?: ProtoValue): Value[string] => {
	if (!value) return { nothing: undefined };

	if (value.nothing) return { nothing: undefined };
	if (value.boolean) return { boolean: value.boolean.v };
	if (value.string) return { string: value.string.v };
	if (value.integer) return { integer: value.integer.v };
	if (value.float) return { float: value.float.v };
	if (value.list) return { list: { vs: value.list.vs.map((v) => convertValue(v)) } };
	if (value.set) return { set: { vs: value.set.vs.map((v) => convertValue(v)) } };
	if (value.dict)
		return {
			dict: {
				items: value.dict.items.map((item) => ({
					k: convertValue(item.k!),
					v: convertValue(item.v!),
				})),
			},
		};
	if (value.bytes) return { bytes: value.bytes.v };
	if (value.time)
		return {
			time: value.time.v
				? { seconds: Number(value.time.v.seconds), nanos: value.time.v.nanos }
				: { seconds: 0, nanos: 0 },
		};
	if (value.duration)
		return {
			duration: value.duration.v
				? { seconds: Number(value.duration.v.seconds), nanos: value.duration.v.nanos }
				: { seconds: 0, nanos: 0 },
		};
	if (value.struct)
		return {
			struct: {
				ctor: convertValue(value.struct.ctor!),
				fields: Object.fromEntries(Object.entries(value.struct.fields).map(([k, v]) => [k, convertValue(v)])),
			},
		};
	if (value.module)
		return {
			module: {
				name: value.module.name,
				members: Object.fromEntries(Object.entries(value.module.members).map(([k, v]) => [k, convertValue(v)])),
			},
		};
	if (value.symbol) return { symbol: { name: value.symbol.name } };
	if (value.function)
		return {
			function: {
				executorId: value.function.executorId,
				name: value.function.name,
				desc: value.function.desc,
				data: value.function.data,
				flags: value.function.flags,
			},
		};
	throw new Error("Unexpected value type");
};
