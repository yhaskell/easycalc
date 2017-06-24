import { assert } from 'chai'
import { Computer } from '../lib/computer'

describe("computer", () => {
    it("computes positive", () => {
        const computer = new Computer()

        const expected = "42"
        const actual = computer.compute("42").toString()

        assert.equal(actual, expected)
    })

    it("computes negative constants", () => {
        const computer = new Computer()

        const expected = "-42"
        const actual = computer.compute("-42").toString()

        assert.equal(actual, expected)
    })

    it("computes complex expressions", () => {
        const computer = new Computer()

        const expression = "2 + 2 * 2 - (14/7-3)"
        const expected = "7"

        const actual = computer.compute(expression).toString()

        assert.equal(actual, expected)
    })

    it("saves values into memory", () => {
        const computer = new Computer()

        const assignment = "a = 42"
        const request = "a"

        const expected = "42"

        computer.compute(assignment)
        const actual = computer.compute(request).toString()

        assert.equal(actual, expected)
    })

    it("saves last computation", () => {
        const computer = new Computer()

        const expression = "42"
        const request = "_"

        const expected = "42"

        computer.compute(expression)
        const actual = computer.compute(request).toString()

        assert.equal(actual, expected)
    })
    
    it("caches constants", () => {
        const computer = new Computer()

        const expression = "42"

        computer.compute(expression)

        assert.equal(computer.cached["42"].toString(), "42")
    })

})