#!/usr/bin/env node

import { Computer } from '../lib/computer'
import * as readline from 'readline'
import * as fs from 'fs'


function REPL() {
    const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
    });

    const computer = new Computer()


    function lineRead(line: string) {
        if (line.match(/^\s*__vars__\s*$/)) {
            for (var key of Object.keys(computer.memory)) {
                var num = computer.memory[key]
                console.log(`${key}: ${num.toFixed(num.decimalPlaces())}`)
            }
        }
        else if (line != "") {


            try {
                const result = computer.compute(line)
                console.log(result.toFixed(result.decimalPlaces()))
            } catch (err) {
                console.log(err.message)
            }
        }
        rl.question("> ", lineRead)
    }

    rl.question("> ", lineRead)
}

function fromFile(filename: string) {
    const computer = new Computer();
    let lines: string[]
    try {
        lines = fs.readFileSync(filename, "utf-8").split("\n")
    } catch (err) {
        console.error(`cannot open file ${filename} for reading.`)
        return 
    }
    
    for (const line of lines) 
        if (line != "") computer.compute(line)
    
    console.log(computer.lastComp.toString())
}

if (process.argv.length == 3) {
    fromFile(process.argv[process.argv.length - 1])
} else if (process.argv.length == 2) {
    REPL()
} else {
    console.error("Usage: " + process.argv0 + " " + process.argv[1] + " [FILE]")
    process.exit(1)
}