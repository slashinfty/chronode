#!/usr/bin/env node

import * as fs from 'fs';
import * as readline from 'node:readline';
import * as readlinePromises from 'node:readline/promises';
import clear from 'console-cls';
import chalk from 'chalk';
import figlet from 'figlet';

// Import files
import { state } from './src/State.js';
import * as View from './src/Views.js';

export const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Read keypresses during process life
readline.emitKeypressEvents(rl.input);
rl.input.setRawMode(true);

// Handling keypresses
rl.input.on('keypress', (str, key) => {
    // To abruptly exit the program: ctrl+c or ctrl+d
    if ([`\x03`, `\x04`].includes(key.sequence)) {
        process.exit(1);
    }
    // To safely exit the program: esc
    if (key.sequence === `\x1B`) {
        // prompt to save?
        process.exit(1);
    }
    // Ignore keypresses
    if (state.status === 'wait') {
        return;
    }
    // Keys to accept
    if (state.status === 'splash') {
        if (str === 'n') {
            View.create();
        } else if (str === 'l') {
            View.load();
        } else if (str === 'r') {
            View.race();
        } else if (str === 'h') {
            View.help();
        }
    } else if (state.status === 'help') {
        splash();
    } else if (state.status === 'create') {
        View.timer();
    }
});

const defaultConfig = {
    "hotkeys": {
        "split": "s",
        "pause": "p",
        "reset": "r",
        "skip": "n",
        "undo": "b",
        "quit": "q"
    },
    "colors": {
        "headers": "white",
        "names": "white",
        "times": "white",
        "timer": "white",
        "ahead": "green",
        "behind": "red",
        "best": "yellowBright"
    },
    "precision": {
        "timer": "S.mmm",
        "splits": "M:SS",
        "deltas": "S.m"
    },
    "defaultSplitPath": ""
}

// Check for config file
if (!fs.existsSync('./config.json')) {
    fs.writeFileSync('./config.json', JSON.stringify(defaultConfig, null, 4));
}
export const config = JSON.parse(fs.readFileSync('./config.json'));

// Splash screen
const splash = () => {
    state.status = 'splash';
    clear();
    console.log(chalk.green(figlet.textSync('chronode', { font: "Speed" })));
    console.log(`Version 0.0.1`);
    console.log(`\nPress...\n* ${chalk.cyan('n')} to create new splits\n* ${chalk.cyan('l')} to load existing splits\n* ${chalk.cyan('r')} to connect to a race on racetime.gg\n* ${chalk.cyan('h')} for help`);
}
splash();