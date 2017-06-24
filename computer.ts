import * as bi from 'big-integer'
import * as AST from './ast'
import ComputerError from './computer-error'
import { parse } from './parser'

export class Computer {
    memory: any = {}

    cached: { [key: string]: bi.BigInteger } = {}

    lastComp: bi.BigInteger

    private computeUnary(node: AST.Unary) {
        switch (node.operator) {
            case "+":
                return this.computeNode(node.value)
            case "-":
                return this.computeNode(node.value).negate()
            default:
                throw new ComputerError(`Unknown operator`, node.position.start, node.position.line)
        }
    }

    private computeBinary(node: AST.Binary) {
        const lr = this.computeNode(node.right)
        if (node.operator === "=") {
            const id = (<AST.Identifier>node.left).value
            this.memory[id] = lr

            return lr
        }
        const lc = this.computeNode(node.left)
        switch (node.operator) {
            case "+":
                return lc.add(lr)
            case "-":
                return lc.subtract(lr)
            case "*":
                return lc.multiply(lr)
            case "/":
                return lc.divide(lr)
            default:
                throw new ComputerError(`Unknown operator`, node.position.start, node.position.line)
        }
    }

    private computeNode(node: AST.Node): bi.BigInteger {
        switch (node.kind) {
            case AST.NodeKind.Const:
                if (this.cached[node.value]) return this.cached[node.value]
                return this.cached[node.value] = bi(node.value)
            case AST.NodeKind.Identifier:
                if (node.value == "_") return this.lastComp
                if (this.memory[node.value]) return this.memory[node.value]
                throw new ComputerError(`Usage of uninitialized variable ${node.value}`, node.position.start, node.position.line)
            case AST.NodeKind.Unary:
                return this.computeUnary(node)
            case AST.NodeKind.Binary:
                return this.computeBinary(node)
        }
    }

    private currentLine = 1
    public compute(line: string) {
        let ast = parse(line, this.currentLine++)
        const result = this.computeNode(ast)
        this.lastComp = result

        return result
    }


}