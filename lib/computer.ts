import BigNumber from 'bignumber.js'
import * as AST from './ast'
import ComputerError from './computer-error'
import { parse } from './parser'

export class Computer {
    memory: { [key: string]: BigNumber } = {
        __precision__: new BigNumber(20) // default value
    }

    cached: { [key: string]: BigNumber } = {}

    lastComp: BigNumber

    private computeUnary(node: AST.Unary) {
        switch (node.operator) {
            case "+":
                return this.computeNode(node.value)
            case "-":
                return this.computeNode(node.value).negated()
            default:
                throw new ComputerError(`Unknown operator`, node.position.start, node.position.line)
        }
    }

    private computeBinary(node: AST.Binary) {
        const lr = this.computeNode(node.right)
        if (node.operator === "=") {
            const id = (<AST.Identifier>node.left).value
            if (id == "_")
                throw new ComputerError("Cannot write into read-only variable _", node.position.start, node.position.line)
            if (id == "__precision__") BigNumber.config({ DECIMAL_PLACES: lr.toNumber() })
            this.memory[id] = lr

            return lr
        }
        const lc = this.computeNode(node.left)
        switch (node.operator) {
            case "+":
                return lc.plus(lr)
            case "-":
                return lc.minus(lr)
            case "*":
                return lc.times(lr)
            case "/":
                return lc.dividedBy(lr)
            default:
                throw new ComputerError(`Unknown operator`, node.position.start, node.position.line)
        }
    }

    private computeNode(node: AST.Node): BigNumber {
        switch (node.kind) {
            case AST.NodeKind.Const:
                if (this.cached[node.value]) return this.cached[node.value]
                return this.cached[node.value] = new BigNumber(node.value)
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