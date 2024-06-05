import React, { useCallback, useEffect, useState } from "react";
import { ServiceResponse } from "./types";
import { Toast } from "@components/atoms";
import { baseUrl, descopeProjectId, isAuthEnabled } from "@constants";
import { AuthProvider, useSession, useUser, Descope } from "@descope/react-sdk";
import { router } from "@routing/routes";
import { useProjectStore } from "@store";
import { useUserStore } from "@store/useUserStore";
import { ProjectsMenuList, User } from "@type/models";
import axios from "axios";
import { t } from "i18next";
import { RouterProvider } from "react-router-dom";

const getAKToken = async (
	sessionJwt: string,
	getLoggedInUser: () => ServiceResponse<User>,
	getProjectsList: () => Promise<{ list: ProjectsMenuList }>
) => {
	try {
		await axios.get(`${baseUrl}/auth/descope/login?jwt=${sessionJwt}`, { withCredentials: true });
		await getLoggedInUser();
		await getProjectsList();
	} catch (error) {
		throw new Error(`Error fetching AK token: ${(error as Error).message}`);
	}
};

const AuthenticationAppContainer: React.FC = () => {
	const { isAuthenticated } = useSession();
	const { getProjectsList } = useProjectStore();
	const [isLoading, setIsLoading] = useState(false);

	const { isUserLoading } = useUser();
	const { user, getLoggedInUser } = useUserStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const handleSuccess = useCallback(
		(e: CustomEvent<any>) => {
			try {
				getAKToken(
					e.detail.sessionJwt,
					() => getLoggedInUser(),
					() => getProjectsList()
				);
			} catch (error) {
				setToast({ isOpen: true, message: (error as Error).message });
			}
			setIsLoading(false);
		},
		[getLoggedInUser, getProjectsList]
	);

	useEffect(() => {
		if (user) {
			getProjectsList();
		}
	}, [user, getProjectsList]);

	return (
		<>
			{isLoading ? (
				<h1 className="text-black w-full text-center text-2xl font-averta-bold mt-6">Loading...</h1>
			) : !isAuthenticated ? (
				<Descope flowId="sign-up-or-in" onSuccess={handleSuccess} />
			) : !isUserLoading && isAuthenticated ? (
				<RouterProvider router={router} />
			) : null}

			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error", { ns: "errors" })}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</>
	);
};

const AppContainerWithoutAuthentication: React.FC = () => {
	const { getProjectsList } = useProjectStore();

	useEffect(() => {
		getProjectsList();
	}, [getProjectsList]);

	return <RouterProvider router={router} />;
};

export const App: React.FC = () => {
	return (
		<div>
			{isAuthEnabled ? (
				<AuthProvider projectId={descopeProjectId}>
					<AuthenticationAppContainer />
				</AuthProvider>
			) : (
				<AppContainerWithoutAuthentication />
			)}
		</div>
	);
};
