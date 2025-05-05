import dayjs, { Dayjs } from "dayjs";
import bigIntSupport from "dayjs/plugin/bigIntSupport";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

import { dateTimeFormat } from "@src/constants";

dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(bigIntSupport);

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
		const diff = Math.abs(this.value.diff(end));

		if (diff < 1000) {
			return `${diff} milliseconds`;
		} else if (diff < 60000) {
			const seconds = Math.floor(diff / 1000);
			const ms = diff % 1000;
			return `${seconds} seconds, ${ms} milliseconds`;
		} else {
			const dur = dayjs.duration(diff);
			return dur.format("H [hours], m [minutes], s [seconds], SSS [milliseconds]");
		}
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
