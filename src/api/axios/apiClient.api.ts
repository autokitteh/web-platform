import { baseApi } from "@api";
import { handleErrorResponse } from "@api/axios";
import { IApiClient } from "@interfaces";
import { RequestConfig } from "@type";
import Axios, { AxiosError, AxiosInstance } from "axios";

export class ApiClient implements IApiClient {
	private client: AxiosInstance;

	protected createAxiosClient(): AxiosInstance {
		return Axios.create({
			baseURL: baseApi,
			responseType: "json" as const,
			headers: {
				"Content-Type": "application/json",
			},
			timeout: 10 * 1000,
		});
	}

	constructor() {
		this.client = this.createAxiosClient();
	}

	async post<TRequest, TResponse>(path: string, payload: TRequest, config?: RequestConfig): Promise<TResponse> {
		try {
			const response = config
				? await this.client.post<TResponse>(path, payload, config)
				: await this.client.post<TResponse>(path, payload);
			return response.data;
		} catch (error) {
			handleErrorResponse(error as AxiosError);
		}
		return {} as TResponse;
	}

	async patch<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse> {
		try {
			const response = await this.client.patch<TResponse>(path, payload);
			return response.data;
		} catch (error) {
			handleErrorResponse(error as AxiosError);
		}
		return {} as TResponse;
	}

	async put<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse> {
		try {
			const response = await this.client.put<TResponse>(path, payload);
			return response.data;
		} catch (error) {
			handleErrorResponse(error as AxiosError);
		}
		return {} as TResponse;
	}

	async get<TResponse>(path: string): Promise<TResponse> {
		try {
			const response = await this.client.get<TResponse>(path);
			return response.data;
		} catch (error) {
			handleErrorResponse(error as AxiosError);
		}
		return {} as TResponse;
	}
}
