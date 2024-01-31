import { ValidateURL } from "@utilities";

export const baseURLFromVSCode: string = "http://localhost:9980";

export const BASE_URL = ValidateURL(baseURLFromVSCode) ? baseURLFromVSCode : "";
