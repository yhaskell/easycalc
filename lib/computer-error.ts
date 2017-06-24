
export class ComputerError extends Error {
    constructor(message: string, position: number, line: number = 1) {
        super(message + ` at ${line}:${position}`)
    }
}

export default ComputerError