import * as AST from './ast'

import { Tokenizer } from './tokenizer'
import { TokenKind, Token } from './token'
import ComputerError from './computer-error'

/*
  R  --> id = A | A
  A  --> M At
  At --> + T At | - T At | e
  M  --> F Mt
  Mt --> * F Mt | / F Mt | e
  Fx --> ( A ) | atom
  F  --> [+-@] Fx
*/

interface Rest { 
    operator: AST.Operator
    argument: AST.Node
    rest: Rest | undefined
}

export class Parser {
    constructor(private tokens: Token[]) {}

    private currentPos: number = 0
    currentToken() { return this.tokens[this.currentPos] }
    previousToken() { return this.tokens[this.currentPos - 1] }

    fail(message: string, token?: Token): AST.Node {
        let t = token || this.currentToken()
        throw new ComputerError(message, t.start, t.line)
    }

    canAcceptOperator(...operators: string[]) {
        const token = this.currentToken()
        if (!token || token.kind != TokenKind.Operator) return false
        if (operators.length === 0) return true
        for (let operator of operators)
            if (token.value === operator) return true

        return false
    }
    acceptOperator(...operators: string[]): AST.Operator {
        const cToken = this.currentToken()
        if (!this.canAcceptOperator(...operators)) this.fail(`expected operator, got ${cToken.value}`)
        const result = cToken.value
        this.currentPos ++

        return <any> result
    }

    

    private parseRest(M: () => AST.Node, ...operators: AST.Operator[]) : Rest | undefined {
        if (this.canAcceptOperator(...operators)) {
            const operator: AST.Operator = this.acceptOperator()
            const argument = M()
            const rest = this.parseRest(M, ...operators)
            return {
                operator,
                argument,
                rest
            }
        }
    }

    private reweightRest(left: AST.Node, rest: Rest | undefined): AST.Node {
        if (!rest) return left
        const position = {
            line: left.position.line,
            start: left.position.start,
            end: rest.argument.position.end
        }
        return this.reweightRest(AST.binary(rest.operator, left, rest.argument, position), rest.rest)
    }

    private parseAdditionRest() {
        return this.parseRest(() => this.parseMultiplication(), "+", "-")
    }

    private parseAddition(): AST.Node {
        const { line, start } = this.currentToken()
        
        const left = this.parseMultiplication()
        const rest = this.parseAdditionRest()

        const { end } = this.previousToken()

        const result = this.reweightRest(left, rest)
        result.position = { line, start, end }

        return result
    }

    private parseMultiplicationRest() {
        return this.parseRest(() => this.parseAtomicForm(), "*", "/")
    }

    private parseMultiplication(): AST.Node {
        const left = this.parseAtomicForm()
        const rest = this.parseMultiplicationRest()

        return this.reweightRest(left, rest)
    }

    private parseSimpleAtomicForm(): AST.Node {
        if (this.currentToken().kind == TokenKind.OpBracket) {
            this.currentPos ++
            const addition = this.parseAddition()
            if (this.currentToken().kind != TokenKind.ClBracket) this.fail(`expected closing bracket, found ${this.currentToken().value}`)
            this.currentPos ++
            return addition
        }
        return this.parseAtom()
    }

    private parseAtomicForm(): AST.Node {
        const { start, line } = this.currentToken()
        if (this.canAcceptOperator("+", "-", "@")) {
            const operator = this.acceptOperator()
            const value = this.parseSimpleAtomicForm()
            return AST.unary(<any>operator, value, { line, start, end: this.previousToken().end })
        }
        return this.parseSimpleAtomicForm()
    }

    private parseAtom(): AST.Atom {
        const token = this.currentToken()
        if (!token) 
            return <AST.Atom> this.fail(`expected number or identifier, got nothing`)
        try {
            if (token.kind == TokenKind.Const) return AST.constant(token.value, { line: token.line, start: token.start, end: token.end })
            else if (token.kind == TokenKind.Identifier) return AST.identifier(token.value, { line: token.line, start: token.start, end: token.end })
        } finally { 
            this.currentPos ++
        }

        return <AST.Atom> this.fail(`expected number or identifier, got ${token.value}`)
    }

    private parseAssignment(): AST.Node {
        const curr = this.currentToken()
        const next = this.tokens[this.currentPos + 1]

        if (next && curr.kind === TokenKind.Identifier && next.kind === TokenKind.Operator && next.value === "=") {
            const left = this.parseAtom()
            this.acceptOperator("=")
            const right = this.parseAddition()
            return AST.binary("=", left, right, { line: curr.line, start: curr.start, end: right.position.end})
        }
        return this.parseAddition()
    }

    parse() {
        const result = this.parseAssignment()
        const rest = this.currentToken()
        if (!!rest)
            return this.fail(`expected end of line, got ${rest.value}`)
        return result
    }
}

export function parse(line: string, lineNo = 1) {
    const tokens = Array.from(new Tokenizer(line, lineNo).parse())
    return new Parser(tokens).parse()
}