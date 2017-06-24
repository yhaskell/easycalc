import { assert, expect } from 'chai'
import { parse } from '../lib/tokenizer'

describe("lexer", () => {
    it("returns an empty list on empty string", () => {
        for (let lexem of parse("")) { assert.fail() }
    })

    it("returns number when passed string with only number", () => {
        assert.equal(parse("123").next().value, "123")
    })
    it("returns number with a point when passed string with only number", () => {
        assert.equal(parse("123.431").next().value, "123.431")
    })
    it("fails when number ends with a point", () => {
        assert.throws(() => parse("123.").next())
    })
    
    it("fails when encounters a point outside of a number", () => {
        assert.throws(() => Array.from(parse("+.+")))
    })

    it("fails when number has two periods", () => {
        assert.throws(() => parse("1.2.3").next())
    })

    it("fails when after number identifier occurs immediately", () => {
        assert.throws(() => parse("1a").next())
    })

    it("returns identifier when passed one", () => {
        assert.equal(parse("a_42").next().value, "a_42")
    })

    it("returns list of operators when passed", () => {
        const operators = "+-*/@)("
        let actual = ""
        for (let op of parse(operators)) actual += op
        assert.equal(operators, actual)
    })
    it("returns number in between operators", () => {
        const line = "(123)"
        const expected = ["(", "123", ")"]
        const actual = Array.from(parse(line))

        assert.deepEqual(expected, actual)
    })
    
    it("returns operator in between numbers", () => {
        const line = "54+1.7"
        const expected = ["54", "+", "1.7"]
        const actual = Array.from(parse(line))

        assert.deepEqual(expected, actual)
    })

    it("ignores whitespaces between lexems", () => {
        const line = "54 + 1.7 - a_1"
        const expected = ["54", "+", "1.7", "-", "a_1"]
        const actual = Array.from(parse(line))

        assert.deepEqual(expected, actual)
    })

    it("splits identifiers and numbers when there is a whitespace inside", () => {
        const line = "1 3 a b"
        const expected = ["1", "3", "a", "b"]
        const actual = Array.from(parse(line))

        assert.deepEqual(expected, actual)
    })

    it("fails when unknown symbol occurs", () => {
        assert.throws(() => Array.from(parse("28 + !")))
    })
})