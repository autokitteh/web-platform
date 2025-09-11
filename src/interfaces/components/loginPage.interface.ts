export interface LoginPageProps {
	descopeRenderKey: number;
	handleSuccess: (event: CustomEvent<any>) => Promise<void>;
	isLoggingIn: boolean;
}
