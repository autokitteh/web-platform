import React, { useState, useEffect } from "react";
import { LogoFrame } from "@assets/image";
import { ArrowLeft } from "@assets/image/icons";
import { IconButton, Frame } from "@components/atoms";
import { SessionsService } from "@services";
import { Session } from "@type/models";
import { cn } from "@utilities";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

export const DeploymentSessions = () => {
	const { t } = useTranslation("deployments", { keyPrefix: "sessions" });
	const [sessions, setSessions] = useState<Session[]>([]);
	const { deploymentId } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		if (!deploymentId) return;
		const fetchSessions = async () => {
			const { data } = await SessionsService.listByDeploymentId(deploymentId);
			data && setSessions(data);
		};
		fetchSessions();
	}, [deploymentId]);

	return (
		<div className="flex h-full">
			<Frame className="pl-7 bg-gray-700 rounded-r-none">
				<div className="flex items-center gap-2.5">
					<IconButton
						ariaLabel={t("ariaLabelReturnBack")}
						className="bg-gray-600 hover:bg-black text-white gap-2 min-w-20 text-sm"
						onClick={() => navigate(-1)}
					>
						<ArrowLeft className="h-4" />
						{t("buttons.back")}
					</IconButton>
					<p className="text-gray-300 text-base">
						{sessions.length} {t("sessionsName")}
					</p>
				</div>
			</Frame>
			<Frame className="w-2/4 rounded-l-none">
				<LogoFrame
					className={cn(
						"absolute fill-white opacity-10 pointer-events-none",
						"max-w-72 2xl:max-w-80 3xl:max-w-420 -bottom-10 2xl:bottom-7 right-2 2xl:right-7"
					)}
				/>
			</Frame>
		</div>
	);
};
