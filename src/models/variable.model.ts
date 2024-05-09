import { Var as ProtoVariable } from "@ak-proto-ts/vars/v1/var_pb";
import { Variable } from "@type/models";

export const convertVariableProtoToModel = (protoVariable: ProtoVariable): Variable => {
	return {
		scopeId: protoVariable.scopeId,
		value: protoVariable.value,
		name: protoVariable.name,
		isSecret: protoVariable.isSecret,
	};
};
