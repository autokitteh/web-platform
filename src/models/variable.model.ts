import { EnvVar as ProtoVariable } from "@ak-proto-ts/envs/v1/env_pb";
import { Variable } from "@type/models";

export const convertVariableProtoToModel = (protoVariable: ProtoVariable): Variable => {
	return {
		envId: protoVariable.envId,
		value: protoVariable.value,
		name: protoVariable.name,
		isSecret: protoVariable.isSecret,
	};
};
