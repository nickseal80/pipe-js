/**
 * Полифилл для withCause
 *
 * @param {string} message
 * @param {Error} cause
 * @return {Error}
 */
export const createErrorWithCause = (message, cause) => {
    let error;

    error = new Error(message);
    if (cause) {
        error.cause = cause;
        error.originalError = cause;
        if (cause.stack) {
            error.stack += `\nCaused by: ${cause.stack}`;
        }
    }

    return error;
};