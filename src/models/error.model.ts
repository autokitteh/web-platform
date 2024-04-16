import { Value } from "@ak-proto-ts/values/v1/values_pb";
import i18n from "i18next";

export function convertErrorProtoToModel(
	protoValue?: Value,
	defaultError: string = i18n.t("services.errorOccured")
): Error {
	return new Error(protoValue?.string?.v || defaultError);
}
