import i18n from "i18next";

import { Value } from "@ak-proto-ts/values/v1/values_pb";

export function convertErrorProtoToModel(
	protoValue?: Value,
	defaultError: string = i18n.t("errorOccured", { ns: "services" })
): Error {
	return new Error(protoValue?.string?.v || defaultError);
}
