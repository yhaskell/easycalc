import { assert } from 'chai'
import { parse } from '../lib/parser'
import * as AST from '../lib/ast'

const defaultPos = { line: 0, start: 0, end: 0 }
const cn = (line: string) => AST.constant(line, defaultPos)
const id = (line: string) => AST.identifier(line, defaultPos)
const un = (operator: "+" | "-" | "@", value: AST.Node) => AST.unary(operator, value, defaultPos)
const bn = (operator: AST.Operator, left: AST.Node, right: AST.Node) => AST.binary(operator, left, right, defaultPos)

function rpi(node: AST.Node) {
    switch (node.kind) {
        case AST.NodeKind.Identifier:
        case AST.NodeKind.Const:
            node.position = defaultPos
            break
        case AST.NodeKind.Unary:
            node.position = defaultPos
            rpi(node.value)
            break
        case AST.NodeKind.Binary:
            node.position = defaultPos
            rpi(node.left)
            rpi(node.right)
            break
        default:
    }
    return node
}

describe("Parser", () => {

    it("breaks when empty line is provided", () => {
        assert.throws(() => rpi(parse("")))
    })

    it("return atomic node when number is provided", () => {
        const line = "123"

        const expected = cn(line)
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("return atomic node when identifier is provided", () => {
        const line = "a42"
        const expected = id(line)
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("returns atomic node when atom provided in brackets", () => {
        const value = "123.456"

        const expected = cn(value)
        const actual = rpi(parse(`(${value})`))

        assert.deepEqual(actual, expected)
    })

    it ("returns unary node when atom is provided with it", () => {
        const line = "-7"

        const expected = un("-", cn("7"))

        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it ("returns addition node for an addition line", () => {
        const line = "5 + a"
        const expected = bn("+", cn("5"), id("a"))
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it ("returns multiplication node for a line with multiplication", () => {
        const line = "5.7 / a"
        const expected = bn("/", cn("5.7"), id("a"))
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("preserves operation order for operations with equal priority", () => {
        const line = "a + b + c"
        const expected = bn("+", 
            bn("+", id("a"), id("b")),
            id("c")
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("preserves operation order for operations with different priority", () => {
        const line = "a + b * c"
        const expected = bn( "+",
            id("a"),
            bn("*", id("b"), id("c"))
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })
    
    it("changes operation order when brackets are used", () => {
        const line = "(a + b) * c"
        const expected = bn("*",
            bn("+", id("a"), id("b")),
            id("c")
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("applies unary operation to atoms when in line with other operators", () => {
        const line = "-4 - 6"
        const expected = bn("-",
            un("-", cn("4")),
            cn("6")
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("applies unary operation to complex nodes", () => {
        const line = "-(5+7)"
        const expected = un("-",
            bn("+", cn("5"), cn("7"))
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("fails when trying to assign to something that is not an l-value", () => {
        const line = "5 + 7 = 42"
        assert.throws(() => rpi(parse(line)))
    })

    it("assigns atomic nodes", () => {
        const line = "a = 42"
        
        const expected = bn("=",
            id('a'),
            cn('42')
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("assigns unary values", () => {
        const line = "a = -7"
        const expected = bn("=", 
            id('a'),
            un("-", cn("7"))
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })

    it("assigns complex nodes", () => {
        const line = "a = (a + b) * c"
        const right = bn("*",
            bn("+", id("a"), id("b")),
            id("c")
        )
        const expected = bn("=",
            id("a"),
            right
        )
        const actual = rpi(parse(line))

        assert.deepEqual(actual, expected)
    })
})