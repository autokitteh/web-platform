import React, { useCallback, useState } from "react";
import { IconButton, Toast } from "@components/atoms";
import { AppWrapper } from "@components/templates";
import { isAuthEnabled } from "@constants";
import { useDescope } from "@descope/react-sdk";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectsService } from "@services";
import { useProjectStore, useUserStore } from "@store";
import randomatic from "randomatic";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

interface ToastState {
	isOpen: boolean;
	message: string;
}

const useToast = (initialState: ToastState = { isOpen: false, message: "" }) => {
	const [toast, setToast] = useState(initialState);
	const openToast = (message: string) => setToast({ isOpen: true, message });
	const closeToast = () => setToast({ ...toast, isOpen: false });

	return { toast, openToast, closeToast };
};

const DashboardContent = ({ userName, createProject }: { userName?: string; createProject: () => Promise<void> }) => (
	<div className="flex h-full">
		<div className="flex w-full">
			<h1 className="text-black w-full text-2xl font-averta-bold mt-6">Hello, {userName}</h1>
			<IconButton
				className="bg-gray-600 h-default-icon group border-r rounded-lg p-4 mt-6 mr-4"
				onClick={createProject}
			>
				<div className="font-averta">New Project</div>
			</IconButton>
		</div>
	</div>
);

const AuthenticatedDashboard: React.FC = () => {
	const { logout } = useDescope();
	const { reset: resetProjectStore } = useProjectStore();
	const { reset: resetUserStore, user } = useUserStore();
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const { t } = useTranslation(["menu", "errors"]);
	const { toast, openToast, closeToast } = useToast();

	const userName = user?.name || "";

	const handleLogout = useCallback(() => {
		resetProjectStore();
		resetUserStore();
		logout();
	}, [logout, resetProjectStore, resetUserStore]);

	const createProject = async () => {
		const projectName = randomatic("Aa", 8);
		const { data: projectId, error } = await ProjectsService.create(projectName);

		if (error) {
			openToast((error as Error).message);
			return;
		}

		navigate(`/${SidebarHrefMenu.projects}/${projectId}`);
		await getProjectsList();
	};

	return (
		<AppWrapper>
			<DashboardContent createProject={createProject} userName={userName} />
			<button className="text-black" onClick={handleLogout}>
				Logout
			</button>
			<Toast duration={5} isOpen={toast.isOpen} onClose={closeToast} title={t("error", { ns: "errors" })} type="error">
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</AppWrapper>
	);
};

const UnauthenticatedDashboard: React.FC = () => {
	const { getProjectsList } = useProjectStore();
	const navigate = useNavigate();
	const { t } = useTranslation(["menu", "errors"]);
	const { toast, openToast, closeToast } = useToast();

	const createProject = async () => {
		const projectName = randomatic("Aa", 8);
		const { data: projectId, error } = await ProjectsService.create(projectName);

		if (error) {
			openToast((error as Error).message);
			return;
		}

		navigate(`/${SidebarHrefMenu.projects}/${projectId}`);
		await getProjectsList();
	};

	return (
		<AppWrapper>
			<DashboardContent createProject={createProject} />
			<Toast duration={5} isOpen={toast.isOpen} onClose={closeToast} title={t("error", { ns: "errors" })} type="error">
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</AppWrapper>
	);
};

export const Dashboard: React.FC = () => {
	return isAuthEnabled ? <AuthenticatedDashboard /> : <UnauthenticatedDashboard />;
};

export default Dashboard;
