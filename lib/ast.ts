import { Token } from "./token";

export enum NodeKind {
    Const, 
    Identifier,
    Unary,
    Binary,
}

export type Operator = "+" | "-" | "*" | "/" | "@" | "="

interface NodePosition {
    line: number
    start: number
    end: number
}

export interface INode {
    kind: NodeKind

    position: NodePosition
}

export interface Const extends INode {
    kind: NodeKind.Const
    value: string
}

export interface Identifier extends INode {
    kind: NodeKind.Identifier
    value: string
}

export type Atom = Const | Identifier

export interface Unary extends INode {
    kind: NodeKind.Unary
    operator: Operator
    value: Node
}

export interface Binary extends INode {
    kind: NodeKind.Binary
    operator: Operator
    left: Node
    right: Node
}

export type Node = Const | Identifier | Unary | Binary



export const constant = (value: string, position: NodePosition): Const => ({
    kind: NodeKind.Const,
    position,
    value
})
export const identifier = (value: string, position: NodePosition): Identifier => ({
    kind: NodeKind.Identifier,
    position,
    value
})
export const unary = (operator: "+" | "-" | "@", value: Node, position: NodePosition): Unary => ({
    kind: NodeKind.Unary,
    position,
    operator, 
    value
})
export const binary = (operator: Operator, left: Node, right: Node, position: NodePosition): Binary => ({
    kind: NodeKind.Binary,
    position,
    operator,
    left,
    right
})



export function serialize(node: Node): string {
    switch (node.kind) {
        case NodeKind.Identifier:
            return `id(${node.value})`
        case NodeKind.Const:
            return `const(${node.value})`
        case NodeKind.Unary:
            return `[${node.operator}]<${serialize(<Node>node.value)}>`
        case NodeKind.Binary:
            return `[${node.operator}]<${serialize(<Node>node.left)}, ${serialize(<Node>node.right)}>`
    }
}