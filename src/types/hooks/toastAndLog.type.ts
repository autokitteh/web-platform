import { AxiosError } from "axios";

export type ErrorType = AxiosError | Error | string | unknown;
