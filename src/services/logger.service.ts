/* eslint-disable no-console */
import { LoggerLevel } from "@enums";
import { useLoggerStore } from "@store";
import moment from "moment";

export class LoggerService {
	private static output(namespace: string, message: string, level: string = LoggerLevel.info): void {
		const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
		const formattedMessage = `[${namespace}] [${level}] ${message}`;
		console.log(`${timestamp} - ${formattedMessage}`);

		if (level === LoggerLevel.error) {
			useLoggerStore.getState().addLog({ timestamp, message: formattedMessage });
		}
	}

	public static info(namespace: string, message: string): void {
		this.output(namespace, message);
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
		console.log(`[${namespace}]: ${message}`);
	}

	public static printError(namespace: string, message: string): void {
		console.log(`Error: [${namespace}]: ${message}`);
	}
}
