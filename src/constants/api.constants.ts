import { ValidateURL } from "@utilities";

export const baseURLFromVSCode: string = "http://localhost:9980";

export const baseUrl = ValidateURL(baseURLFromVSCode) ? baseURLFromVSCode : "";
