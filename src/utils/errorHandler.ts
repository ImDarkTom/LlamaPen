import { emitter } from "../mitt";

class ErrorHandler {
    constructor() {}

    handleError(error: unknown, message: string = 'An error occured', popup:boolean = false) {
        console.error(message, error);

        if (popup) {
            this.showPopup(message);
        }
    }

    private showPopup(message: string) {
        emitter.emit('showPopup', message);
    }
}

const errorHandler = new ErrorHandler();

export default errorHandler;