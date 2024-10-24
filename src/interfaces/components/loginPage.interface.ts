export interface LoginPageProps {
	descopeRenderKey: number;
	handleSuccess: (event: CustomEvent<any>) => Promise<void>;
	t: (key: string, options?: any) => string;
}
