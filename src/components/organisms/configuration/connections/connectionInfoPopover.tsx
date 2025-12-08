import React, { ComponentType, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { getInfoLinksByIntegration } from "@constants/lists/connections/integrationInfoLinks.constants";
import { VariablesService } from "@services";
import { LoggerService } from "@services/logger.service";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useCacheStore } from "@src/store";
import { stripGoogleConnectionName } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { ConnectionTableStatus, Accordion, IdCopyButton } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ExternalLinkIcon } from "@assets/image/icons";

interface ConnectionInfoPopoverProps {
	connectionId: string;
	icon?: ComponentType<React.SVGProps<SVGSVGElement>>;
}

const authTypeLabels: Record<ConnectionAuthType, string> = {
	[ConnectionAuthType.Oauth]: "OAuth 2.0",
	[ConnectionAuthType.OauthDefault]: "OAuth v2 - Default app",
	[ConnectionAuthType.OauthPrivate]: "OAuth v2 - Private app",
	[ConnectionAuthType.Pat]: "PAT + Webhook",
	[ConnectionAuthType.ServiceAccount]: "Service Account",
	[ConnectionAuthType.Mode]: "Mode",
	[ConnectionAuthType.NoAuth]: "No Auth",
	[ConnectionAuthType.Basic]: "Basic",
	[ConnectionAuthType.Bearer]: "Bearer",
	[ConnectionAuthType.ApiKey]: "API Key",
	[ConnectionAuthType.Key]: "Key",
	[ConnectionAuthType.JsonKey]: "JSON Key",
	[ConnectionAuthType.Json]: "Service Account (JSON Key)",
	[ConnectionAuthType.ApiToken]: "API Token",
	[ConnectionAuthType.AuthToken]: "Auth Token",
	[ConnectionAuthType.AWSConfig]: "AWS Config",
	[ConnectionAuthType.Socket]: "Socket Mode",
	[ConnectionAuthType.BotToken]: "Bot Token",
	[ConnectionAuthType.serverToServer]: "Server-to-Server",
	[ConnectionAuthType.DaemonApp]: "Daemon Application",
	[ConnectionAuthType.Initialized]: "Initialized",
};

export const ConnectionInfoPopover = ({ connectionId, icon }: ConnectionInfoPopoverProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "connections.table.popover" });
	const { t: tIntegrations } = useTranslation("integrations");
	const connection = useCacheStore((state) =>
		state.connections?.find((connection) => connection.connectionId === connectionId)
	);
	const [authType, setAuthType] = useState<ConnectionAuthType | null>(null);

	useEffect(() => {
		const fetchAuthType = async () => {
			const { data: vars } = await VariablesService.list(connectionId);
			const authTypeVar = vars?.find((variable) => variable.name === "auth_type");
			if (authTypeVar) {
				setAuthType(authTypeVar.value as ConnectionAuthType);
			}
		};

		if (connectionId) {
			fetchAuthType();
		}
	}, [connectionId]);

	if (!connection) return null;

	if (!icon) {
		LoggerService.warn("ConnectionInfoPopover", `Missing icon for connection: ${connectionId}`, true);

		return null;
	}

	const integrationKey = stripGoogleConnectionName(connection.integrationUniqueName || "") as Integrations;
	const quickLinks = getInfoLinksByIntegration(integrationKey).filter((link) => link.text && link.url);

	return (
		<PopoverWrapper animation="slideFromBottom" interactionType="hover">
			<PopoverTrigger>
				<span className="cursor-pointer rounded-full bg-white p-1">
					<IconSvg size="sm" src={icon} />
				</span>
			</PopoverTrigger>
			<PopoverContent className="z-40 rounded-lg border-0.5 border-white bg-black p-4">
				<div className="text-white">
					<div className="mb-2 flex w-full items-center justify-between">
						<div className="flex font-semibold">
							<IconSvg className="mr-2 size-4 shrink-0 rounded-full bg-white p-0.5" src={icon} />
							{t("titleInfo")}
						</div>
						<ConnectionTableStatus status={connection.status} />
					</div>

					<dl className="flex items-center gap-x-1">
						<dt className="font-semibold">{t("connectionId")}:</dt>
						<dd data-testid="connection-detail-connection-id">
							<IdCopyButton displayFullLength id={connection.connectionId} />
						</dd>
					</dl>

					{authType ? (
						<dl className="flex items-center gap-x-1">
							<dt className="font-semibold">{tIntegrations("authType")}:</dt>
							<dd data-testid="connection-detail-auth-type">{authTypeLabels[authType] || authType}</dd>
						</dl>
					) : null}

					{quickLinks.length > 0 ? (
						<div
							className="mt-3 border-t border-gray-700 pt-3"
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							role="presentation"
						>
							<Accordion
								accordionKey="quick-links"
								classChildren="py-1"
								className="w-full"
								hideDivider
								title={tIntegrations("quickLinks")}
							>
								<ul className="space-y-1">
									{quickLinks.map(({ text, url }) =>
										text && url ? (
											<li key={url}>
												<a
													className="flex items-center gap-1 text-sm text-green-800 hover:underline"
													href={url}
													rel="noopener noreferrer"
													target="_blank"
												>
													<ExternalLinkIcon className="size-3" />
													{text}
												</a>
											</li>
										) : null
									)}
								</ul>
							</Accordion>
						</div>
					) : null}
				</div>
			</PopoverContent>
		</PopoverWrapper>
	);
};
