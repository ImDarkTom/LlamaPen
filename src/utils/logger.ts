// Requirements:
// - A logger that can log different things based off of levels.
// - Not log certain things based off env (dev/prod).
// - Only log to console.log() not file or other;
// - Reference time and where it occured, like Java syntax. i.e. [2023-10-01 12:00:00] [src/utils/logger.ts] [INFO] Hello World
// - Be able to pass objects/data

import { useConfigStore } from '@/stores/config';

class Logger {
	private shouldLog = false;

	constructor() {
		this.shouldLog = useConfigStore().developer.infoLogs;
	}

	info(origin: string, ...data: any) {
		if (!this.shouldLog) return;

		const currentTime = new Date().toLocaleString();

		console.info(
			`[${currentTime}] [%c${origin}%c] [%cINFO%c]`,
			'color: lightblue', '', 'color: #BBBBBB', '',
			...data
		);
	}

	warn(origin: string, ...data: any) {
		const currentTime = new Date().toLocaleString();

		console.warn(
			`[${currentTime}] [%c${origin}%c] [%cWARN%c]`,
			'color: lightblue', '', 'color: orange', '',
			...data
		);
	}
}

const logger = new Logger();

export default logger;