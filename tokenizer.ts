import { Identifier } from './ast';
import ParseError from './parse-error';

export enum TokenKind {
    Const, 
    Identifier,
    Operator,
    OpBracket,
    ClBracket,
}

export interface Token {
    kind: TokenKind
    value: string
    line: number
    start: number
    end: number
}

export class Tokenizer {
    constructor(public line: string, public lineNo: number) {}

    private position: number = 0

    private makeToken(kind: TokenKind, start: number, end: number, value?: string) {
        return {
            kind,
            line: this.lineNo,
            start,
            end,
            value: value || this.line.substring(start, end)
        }
    }

    parseNumber(): Token {
        let start = this.position
        let i = this.position
        let line = this.line
        let stop = false

        for (;; i++) {
            const next = line[i + 1]
            if (next === '.') {
                if (stop) throw new ParseError("two periods occur in one number", i + 1, this.lineNo)
                
                stop = true
                continue
            }
            if (isLetterOrUnderscore(next)) throw new ParseError(`expected number, got ${next}`, i + 1, this.lineNo)
            if (isDigit(next)) continue

            break
        }
        if (line[i] === '.') throw new ParseError("number cannot end with a point", i, this.lineNo)

        this.position = i

        return this.makeToken(TokenKind.Const, start, i + 1)
    }


    parseIdentifier(): Token {
        const start = this.position
        let i = this.position
        let line = this.line 

        let next = line[i + 1]
        while (isLetterOrUnderscore(next) || isDigit(next)) next = line[++i + 1]

        this.position = i

        return this.makeToken(TokenKind.Identifier, start, i + 1)
    }

    * parse() : IterableIterator<Token> {
        const lLength = this.line.length

        for (this.position = 0; this.position < lLength; this.position++) {
            const char = this.line[this.position]

            if (isDigit(char)) yield this.parseNumber();
            else if (isLetterOrUnderscore(char)) yield this.parseIdentifier()
            else if (isOperator(char)) 
                yield this.makeToken(TokenKind.Operator, this.position, this.position + 1, char)
            else if (isWhitespace(char)) 
                continue
            else 
                throw new ParseError(`expected number, identifier or operator, got ${char}`, this.position, this.lineNo)
        }
    }
}




export function isWhitespace(char: string) {
    return char === ' ' || char === '\t'
}

export function isDigit(num: any) {
    if (num === "" || isWhitespace(num)) return false
    for (let i = 0; i < 10; i++) 
        if (num == i) return true

    return false
}

export function isLetterOrUnderscore(value: string) {
    if (value === undefined) return false
    return /[A-Za-z_]/.test(value)
}

export function isOperator(value: string) {
    for (let op of "+-*/()@")
        if (op === value) return true

    return false
}



export function* parse(line: string, lineNo = 1) {
    const tokenizer = new Tokenizer(line, lineNo)

    for (const token of tokenizer.parse())
        yield token.value

}