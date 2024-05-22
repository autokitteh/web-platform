import { useEffect, useState } from "react";
import { ProjectsService } from "@services";
import { Project } from "@type/models";

export const useProject = (projectId?: string) => {
	const [project, setProject] = useState<Project>({ name: "", projectId: "" });
	const [toast, setToast] = useState({ isOpen: false, isSuccess: false, message: "" });

	useEffect(() => {
		if (!projectId) return;
		const fetchProject = async () => {
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
		fetchProject();
	}, [projectId]);

	return { project, setProject, toast, setToast };
};
