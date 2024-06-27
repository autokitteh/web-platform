/* eslint-disable no-console */
import { LoggerLevel } from "@enums";
import { useLoggerStore } from "@store";
import moment from "moment";

export class LoggerService {
	private static output(namespace: string, message: string, level: LoggerLevel = LoggerLevel.info): void {
		const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
		const formattedMessage = `[${namespace}] [${level}] ${message}`;

		switch (level) {
			case LoggerLevel.error:
				console.error(`${timestamp} - ${formattedMessage}`);
				break;
			case LoggerLevel.warn:
				console.warn(`${timestamp} - ${formattedMessage}`);
				break;
			case LoggerLevel.debug:
				console.debug(`${timestamp} - ${formattedMessage}`);
				break;
			case LoggerLevel.info:
			default:
				console.log(`${timestamp} - ${formattedMessage}`);
				break;
		}

		useLoggerStore.getState().addLog({ timestamp, message: formattedMessage, status: level });
	}

	public static info(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.info);
	}

	public static error(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.error);
	}

	public static debug(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.debug);
	}

	public static warn(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.warn);
	}

	public static print(namespace: string, message: string): void {
		this.output(namespace, message, LoggerLevel.log);
	}
}
