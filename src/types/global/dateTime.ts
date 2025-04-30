import dayjs, { Dayjs } from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

import { dateTimeFormat } from "@src/constants";

dayjs.extend(duration);
dayjs.extend(relativeTime);

export class AkDateTime {
	private value: Dayjs;
	private formatStr: string;

	constructor(date?: string | number | Date | Dayjs | bigint, formatStr = dateTimeFormat) {
		this.value = dayjs(date);
		this.formatStr = formatStr;
	}

	valueOf(): Dayjs {
		return this.value;
	}

	toString(formatStr?: string): string {
		return this.value.format(formatStr || this.formatStr);
	}

	duration(to?: AkDateTime): string {
		const end = to ? to.value : dayjs();
		const dur = dayjs.duration(end.diff(this.value), "seconds");
		return dur.humanize(true);
	}

	isBefore(date: AkDateTime): boolean {
		return this.value.isBefore(date.value);
	}

	getTime(): number {
		return this.value.toDate().getTime();
	}

	toDate(): Date {
		return this.value.toDate();
	}

	fromNow(): string {
		return this.duration(new AkDateTime());
	}
}
