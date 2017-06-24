import { Computer } from './computer'
import * as readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const computer = new Computer()

function lineRead(line: string) {
    if (line != "") {
        try {
            const result = computer.compute(line)
            console.log(result.toString())
        } catch (err) {
            console.log(err.message)
        }
    }
    rl.question("> ", lineRead)
}

rl.question("> ", lineRead)