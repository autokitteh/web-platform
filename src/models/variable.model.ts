import { Variable } from "@type/models";

export const convertVariableProtoToModel = (protoVariable: Variable): Variable => {
	return {
		scopeId: protoVariable.scopeId,
		value: protoVariable.value,
		name: protoVariable.name,
		isSecret: protoVariable.isSecret,
	};
};
