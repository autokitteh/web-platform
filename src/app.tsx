import React, { useCallback, useState } from "react";
import { useUserStore } from "./store/useUserStore";
import { Toast } from "@components/atoms";
import { baseUrl, isAuthEnabled } from "@constants";
import { AuthProvider, useSession, useUser, Descope } from "@descope/react-sdk";
import { router } from "@routing/routes";
import { useProjectStore } from "@store";
import { ProjectsMenuList, User } from "@type/models";
import axios from "axios";
import { t } from "i18next";
import { RouterProvider } from "react-router-dom";

const getAKToken = async (
	sessionJwt: string,
	getLoggedInUser: () => Promise<{ user?: User }>,
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

export const App: React.FC = () => {
	return (
		<AuthProvider projectId="P2gBMthNrBAMwJ4nH5V3rOEvtNw8">
			<AppContainer />
		</AuthProvider>
	);
};

const AppContainer: React.FC = () => {
	const { isAuthenticated, isSessionLoading } = useSession();
	const { getProjectsList } = useProjectStore();
	const { isUserLoading } = useUser();
	const { getLoggedInUser } = useUserStore();
	const [toast, setToast] = useState({
		isOpen: false,
		message: "",
	});

	const handleSuccess = useCallback(
		(e: CustomEvent<any>) => {
			try {
				getAKToken(e.detail.sessionJwt, getLoggedInUser, getProjectsList);
			} catch (error) {
				setToast({ isOpen: true, message: (error as Error).message });
			}
		},
		[getLoggedInUser, getProjectsList]
	);

	if (isSessionLoading || isUserLoading) {
		return <p>Loading...</p>;
	}

	return (
		<div>
			{!isAuthenticated && isAuthEnabled ? <Descope flowId="sign-up-or-in" onSuccess={handleSuccess} /> : null}
			{(!isUserLoading && isAuthenticated) || !isAuthEnabled ? <RouterProvider router={router} /> : null}
			<Toast
				duration={5}
				isOpen={toast.isOpen}
				onClose={() => setToast({ ...toast, isOpen: false })}
				title={t("error", { ns: "errors" })}
				type="error"
			>
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</div>
	);
};
