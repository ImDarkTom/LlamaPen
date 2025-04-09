// Requirements:
// - Not log certain things based off env (dev/prod).

class Logger {
	private shouldLog: boolean;

	constructor() {
		// TODO: make this env-dependent
		this.shouldLog = false;
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