import React, { useState } from "react";
import { GraphUp, Plus } from "@assets/image/icons";
import { IconButton, IconSvg, SearchInput, Toast } from "@components/atoms";
import { DashboardWrapper } from "@components/templates";
import { isAuthEnabled } from "@constants";
import { SidebarHrefMenu } from "@enums/components";
import { ProjectsService } from "@services";
import { useUserStore } from "@store";
import { useProjectStore } from "@store";
import randomatic from "randomatic";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
const DashboardContent = ({ userName, createProject }: { userName?: string; createProject: () => Promise<void> }) => (
	<div className="flex h-full">
		<div className="flex flex-col flex-2">
			<div className="flex w-full">
				<h1 className="text-black w-full text-2xl font-averta-bold mt-6">
					Welcome {userName ? `, ${userName}` : null}
				</h1>
				<IconButton
					className="bg-gray-600 h-default-icon group border-r rounded-lg p-4 mt-6 mr-4"
					onClick={createProject}
				>
					<Plus className="transition fill-white w-5 h-5 mr-4" />
					<div className="font-averta">New Project</div>
				</IconButton>
			</div>
			<div className="flex mt-8">
				<img alt="autokitteh dashboard" src="src/assets/image/demo/dashboard.png" />
			</div>
		</div>
		<div className="flex flex-1 bg-gray-100 flex-col pl-4">
			<div className="flex">
				<IconSvg className="w-7 h-7 mt-6 mr-4" src={GraphUp} />
				<div className="text-black font-averta-semi-bold mt-6 text-2xl">Community Projects</div>
			</div>
			<div className="flex">
				<SearchInput className="mt-6 w-full mr-4" placeholder="Explore community" />
			</div>
			<div>
				<img alt="community projects" src="src/assets/image/demo/community-projects.png" />
			</div>
		</div>
	</div>
);
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

export const Dashboard: React.FC = () => {
	const { user, logoutFunction } = useUserStore();
	const navigate = useNavigate();
	const { t } = useTranslation(["menu", "errors"]);
	const { toast, openToast, closeToast } = useToast();
	const { getProjectsList } = useProjectStore();

	const userName = user?.name || "";

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
		<DashboardWrapper>
			<DashboardContent createProject={createProject} userName={userName} />
			{isAuthEnabled ? (
				<button className="text-black" onClick={() => logoutFunction()}>
					Logout
				</button>
			) : null}
			<Toast duration={5} isOpen={toast.isOpen} onClose={closeToast} title={t("error", { ns: "errors" })} type="error">
				<p className="mt-1 text-xs">{toast.message}</p>
			</Toast>
		</DashboardWrapper>
	);
};
