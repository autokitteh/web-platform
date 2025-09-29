export interface LoginPageProps {
	handleSuccess: (token: string) => Promise<void>;
	isLoggingIn: boolean;
}
