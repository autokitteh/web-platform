import { Value } from "@ak-proto-ts/values/v1/values_pb";
import { t } from "i18next";

export function convertErrorProtoToModel(protoValue?: Value, defaultError: string = t("errors.errorOccured")): Error {
	return new Error(protoValue?.string?.v || defaultError);
}
