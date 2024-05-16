import React from "react";
import { SessionState } from "@enums";
import i18n from "i18next";

export const DeploymentSessionState = ({ sessionState }: { sessionState: SessionState }) => {
	switch (sessionState) {
		case SessionState.CREATED:
			return (
				<div
					aria-label={i18n.t("sessions.table.statuses.active", { ns: "deployments" })}
					className="text-white"
					role="status"
				>
					{i18n.t("sessions.table.statuses.active", { ns: "deployments" })}
				</div>
			);
		case SessionState.RUNNING:
			return (
				<div
					aria-label={i18n.t("sessions.table.statuses.running", { ns: "deployments" })}
					className="text-blue-500"
					role="status"
				>
					{i18n.t("sessions.table.statuses.running", { ns: "deployments" })}
				</div>
			);
		case SessionState.STOPPED:
			return (
				<div
					aria-label={i18n.t("sessions.table.statuses.stopped", { ns: "deployments" })}
					className="text-yellow-500"
					role="status"
				>
					{i18n.t("sessions.table.statuses.stopped", { ns: "deployments" })}
				</div>
			);
		case SessionState.ERROR:
			return (
				<div
					aria-label={i18n.t("sessions.table.statuses.error", { ns: "deployments" })}
					className="text-red-500"
					role="status"
				>
					{i18n.t("sessions.table.statuses.error", { ns: "deployments" })}
				</div>
			);
		case SessionState.COMPLETED:
			return (
				<div
					aria-label={i18n.t("sessions.table.statuses.completed", { ns: "deployments" })}
					className="text-green-500"
					role="status"
				>
					{i18n.t("sessions.table.statuses.completed", { ns: "deployments" })}
				</div>
			);
		default:
			return (
				<div
					aria-label={i18n.t("sessions.table.statuses.unspecified", { ns: "deployments" })}
					className="text-blue-500"
					role="status"
				>
					{i18n.t("sessions.table.statuses.unspecified", { ns: "deployments" })}
				</div>
			);
	}
};
