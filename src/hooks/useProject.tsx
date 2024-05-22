import { useEffect, useState } from "react";
import { ProjectsService } from "@services";
import { Project } from "@type/models";

export const useProject = (projectId?: string) => {
	const [project, setProject] = useState<Project>({ name: "", projectId: "" });
	const [toast, setToast] = useState({ isOpen: false, isSuccess: false, message: "" });

	const fetchProject = async () => {
		if (!projectId) return;
		const { data, error } = await ProjectsService.get(projectId);
		if (error) {
			setToast({
				isSuccess: !error,
				isOpen: true,
				message: error ? (error as Error).message : (error as Error).message,
			});
			return;
		}
		data && setProject(data);
	};

	useEffect(() => {
		fetchProject();
	}, [projectId]);

	return { project, setProject, toast, setToast };
};
