import { emitter } from "../mitt";

class ErrorHandler {
    constructor() {}

    handleError(error: unknown, message: string = 'An error occured', popup:boolean = false) {
        console.error(message, error);

        if (popup) {
            this.showErrorPopup(message);
        }
    }

    private showErrorPopup(message: string) {
        emitter.emit('showErrorPopup', message);
    }
}

const errorHandler = new ErrorHandler();

export default errorHandler;