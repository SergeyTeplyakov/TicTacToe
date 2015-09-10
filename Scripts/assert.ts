module Debug {

    export function assert(expression: boolean, message: string) {
        if (!expression) {
            throw new Error('Assertion failed: ' + message);
        }
    }
}