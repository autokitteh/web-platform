import { Variable } from "@types/models";

import { Var as ProtoVariable } from "@ak-proto-ts/vars/v1/var_pb";

export const convertVariableProtoToModel = (protoVariable: ProtoVariable): Variable => {
	return {
		isSecret: protoVariable.isSecret,
		name: protoVariable.name,
		scopeId: protoVariable.scopeId,
		value: protoVariable.value,
	};
};
