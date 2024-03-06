import moment from "moment";

/**
 * Checks whether the cache needs to be updated based on the specified number of hours and the last cache update time.
 *
 * @param hours - The number of hours to cache.
 * @param cacheTime - The last cache update time in milliseconds, or null if there was no update.
 * @returns {boolean} Returns true if the cache needs to be updated.
 */
export function shouldUpdateCache(hours: number, cacheTime: number | undefined): boolean {
	const now = moment();
	const lastUpdated = cacheTime ? moment(cacheTime) : null;
	const cacheDuration = moment.duration(hours, "hours");

	return !lastUpdated || now.isAfter(lastUpdated.add(cacheDuration));
}
