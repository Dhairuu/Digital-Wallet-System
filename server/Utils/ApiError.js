class ApiError extends Error {
    constructor(status, message, isOperational = true, stack = '') {
        super(message);
        this.status = status;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError;