// src/hooks/useInfiniteSessionsByScope.ts
import { useInfiniteQuery } from "@tanstack/react-query";

import { sessionsClient } from "@api/grpc/clients.grpc.api";
import { convertSessionProtoToModel } from "@models";
import {
	SessionStateType as ProtoSessionStateType,
	SessionStateType,
} from "@src/autokitteh/proto/gen/ts/autokitteh/sessions/v1/session_pb";
import { ListRequest } from "@src/autokitteh/proto/gen/ts/autokitteh/sessions/v1/svc_pb";

type Scope = { projectId: string } | { deploymentId: string };

export interface SessionFilter {
	stateType?: SessionStateType;
}

export const useInfiniteSessionsByScope = (scope: Scope, filter?: SessionFilter, pageSize = 50, enabled = true) => {
	const isByDeployment = "deploymentId" in scope;
	const queryKey = isByDeployment
		? ["sessions", "byDeployment", scope.deploymentId, filter]
		: ["sessions", "byProject", scope.projectId, filter];

	return useInfiniteQuery({
		queryKey,
		enabled,
		initialPageParam: "",
		queryFn: async ({ pageParam }) => {
			const input = new ListRequest({
				...(isByDeployment ? { deploymentId: scope.deploymentId } : { projectId: scope.projectId }),
				pageSize,
				pageToken: pageParam,
				stateType: filter?.stateType as ProtoSessionStateType,
			});

			const response = await sessionsClient.list(input);

			return {
				...response,
				sessions: response.sessions.map((s) => convertSessionProtoToModel(s)),
			};
		},
		getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
	});
};
