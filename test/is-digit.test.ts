import { assert } from 'chai'
import { isDigit } from '../lib/tokenizer'

describe("isDigit", () => {
    it("returns true on digits passed as numbers", () => {
        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        for (let digit of digits)
            assert.isTrue(isDigit(digit), digit.toString())
    })

    it("returns true on digits passed as strings", () => {
        const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(u => `${u}`)
        for (let digit of digits)
            assert.isTrue(isDigit(digit), digit.toString())
    })

    it("returns false on arbitrary symbols", () => {
        const symbols = ["a", ",", ".", "&", "聖"]
        for (let symbol of symbols)
            assert.isFalse(isDigit(symbol), symbol)
    })

    it("returns false on empty string", () => {
        assert.isFalse(isDigit(""))
    })

    it("returns false on whitespaces", () => {
        assert.isFalse(isDigit(" "))
        assert.isFalse(isDigit("\t"))
    })

    it("returns false if string is not of length 1", () => {
        const strings = ["42", "abc", "4av", "a3"]
        for (let str of strings) {
            assert.isFalse(isDigit(str), str)
        }
    })
})