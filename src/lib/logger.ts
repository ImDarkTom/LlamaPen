class Logger {
	private shouldLog: boolean;

	constructor() {
		this.shouldLog = import.meta.env.MODE === 'development';
	}

	info(origin: string, ...data: unknown[]) {
		if (!this.shouldLog) return;

		const currentTime = new Date().toLocaleString();

		console.info(
			`[${currentTime}] [%c${origin}%c] [%cINFO%c]`,
			'color: lightblue', '', 'color: #BBBBBB', '',
			...data
		);
	}

	warn(origin: string, ...data: unknown[]) {
		const currentTime = new Date().toLocaleString();

		console.warn(
			`[${currentTime}] [%c${origin}%c] [%cWARN%c]`,
			'color: lightblue', '', 'color: orange', '',
			...data
		);
	}
	
	error(origin: string, ...data: unknown[]) {
		const currentTime = new Date().toLocaleString();

		console.error(
			`[${currentTime}] [%c${origin}%c] [%ERROR%c]`,
			'color: lightblue', '', 'color: red', '',
			...data
		);
	}
}

const logger = new Logger();

export default logger;