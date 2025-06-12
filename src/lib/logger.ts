class Logger {
	private shouldLog: boolean;

	constructor() {
		this.shouldLog = import.meta.env.MODE === 'development';
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