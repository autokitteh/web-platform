import { EnvVar as ProtoVariable } from "@ak-proto-ts/envs/v1/env_pb";
import { TVariable } from "@type/models";

export const convertVariableProtoToModel = (protoVariable: ProtoVariable): TVariable => {
	return {
		envId: protoVariable.envId,
		value: protoVariable.value,
		name: protoVariable.name,
		isSecret: protoVariable.isSecret,
	};
};
