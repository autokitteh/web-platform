import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { authTypeLabels } from "@constants/connections";
import { getInfoLinksByIntegration } from "@constants/lists/connections/integrationInfoLinks.constants";
import { ConnectionInfoPopoverProps } from "@interfaces/components";
import { VariablesService } from "@services";
import { LoggerService } from "@services/logger.service";
import { ConnectionAuthType } from "@src/enums";
import { Integrations } from "@src/enums/components";
import { useCacheStore, useGlobalConnectionsStore } from "@src/store";
import { stripGoogleConnectionName } from "@src/utilities";

import { IconSvg } from "@components/atoms";
import { ConnectionTableStatus, Accordion, IdCopyButton } from "@components/molecules";
import { PopoverContent, PopoverTrigger, PopoverWrapper } from "@components/molecules/popover";

import { ExternalLinkIcon } from "@assets/image/icons";

export const ConnectionInfoPopover = ({ connectionId, icon, isOrgConnection = false }: ConnectionInfoPopoverProps) => {
	const { t } = useTranslation("tabs", { keyPrefix: "connections.table.popover" });
	const { t: tIntegrations } = useTranslation("integrations");

	const projectConnection = useCacheStore((state) =>
		state.connections?.find((connection) => connection.connectionId === connectionId)
	);
	const orgConnection = useGlobalConnectionsStore((state) =>
		state.globalConnections?.find((connection) => connection.connectionId === connectionId)
	);

	const connection = isOrgConnection ? orgConnection : projectConnection;

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
	const testIdPrefix = isOrgConnection ? "org-connection" : "connection";

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
						<dd data-testid={`${testIdPrefix}-detail-connection-id`}>
							<IdCopyButton displayFullLength id={connection.connectionId} />
						</dd>
					</dl>

					{authType ? (
						<dl className="flex items-center gap-x-1">
							<dt className="font-semibold">{tIntegrations("authType")}:</dt>
							<dd data-testid={`${testIdPrefix}-detail-auth-type`}>
								{authTypeLabels[authType] || authType}
							</dd>
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
