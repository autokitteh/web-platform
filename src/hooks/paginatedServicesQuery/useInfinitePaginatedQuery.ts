import { useInfiniteQuery, QueryFunctionContext } from "@tanstack/react-query";

type PaginatedFetcher<TRequest, TResponse> = (
	input: TRequest & { pageToken?: string }
) => Promise<TResponse & { nextPageToken?: string }>;

export function useInfinitePaginatedQuery<TRequest, TResponse>(
	queryKey: (req: TRequest) => unknown[],
	fetchPage: PaginatedFetcher<TRequest, TResponse>,
	request: TRequest,
	enabled = true
) {
	return useInfiniteQuery({
		queryKey: queryKey(request),
		queryFn: async ({ pageParam }: QueryFunctionContext) => {
			const token = typeof pageParam === "string" ? pageParam : undefined;
			return fetchPage({ ...request, pageToken: token });
		},
		getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
		initialPageParam: undefined,
		enabled,
	});
}
