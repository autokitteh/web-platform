import { Var as ProtoVariable } from "@ak-proto-ts/vars/v1/var_pb";
import { Variable } from "@type/models";

export const convertVariableProtoToModel = (protoVariable: ProtoVariable): Variable => {
	return {
		isSecret: protoVariable.isSecret,
		name: protoVariable.name,
		scopeId: protoVariable.scopeId,
		value: protoVariable.value,
	};
};
