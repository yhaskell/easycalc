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
