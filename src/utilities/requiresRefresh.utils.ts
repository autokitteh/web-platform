import dayjs from "dayjs";

export const requiresRefresh = (lastRefreshDate: dayjs.Dayjs | null, refreshInterval: number): boolean => {
	if (!lastRefreshDate) return true;
	const currentTime = dayjs();
	return currentTime.diff(lastRefreshDate) >= refreshInterval;
};
