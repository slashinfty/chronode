#!/usr/bin/env node

// Import modules
import * as fs from 'fs';
import * as readline from 'node:readline';
import * as readlinePromises from 'node:readline/promises';
import { URL } from 'url';
import clear from 'console-cls';
import chalk from 'chalk';
import figlet from 'figlet';

// Import files
import * as View from './src/Views.js';

// ESM __dirname
export const dirname = new URL('.', import.meta.url).pathname;

// Readline
export const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout
});

export const status = {
    "state": "splash"
};

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
    if (status.state === 'wait') {
        return;
    }
    // Keys to accept...
    // ...during plash screen
    if (status.state === 'splash') {
        if (str === 'n') {
            View.create();
        } else if (str === 'l') {
            status.state = 'load-before';
            clear();
            console.log(`Press ${chalk.cyan('l')} for local file or ${chalk.cyan('s')} for splits.io`);
        } else if (str === 'r') {
            View.race();
        } else if (str === 'h') {
            View.help();
        }
    // ...during help screen
    } else if (status.state === 'help') {
        splash();
    // ...when ready to load to the timer
    } else if (status.state === 'ready') {
        View.active();
    // ...to determine how to load splits
    } else if (status.state === 'load-before') {
        if (str === 'l') {
            View.load('local');
        } else if (str === 's') {
            View.load('splitsio');
        }
    // ...while the timer is active
    } else if (status.state === 'timer') {
        if (str === config.hotkeys.split) {
            if (View.timer.timer.running === false && View.timer.timer.started === false) {
                View.timer.start();
            } else if (View.timer.lap < View.timer.segments.length) {
                View.timer.split();
                if (View.timer.lap === View.timer.segments.length) {
                    status.state = 'timer-stop';
                    console.log(`\nPress...\n* ${chalk.cyan('r')} to reset the timer\n* ${chalk.cyan('g')} to save any new best segments\n* ${chalk.cyan('p')} to save the current run as a personal best\n* ${chalk.cyan('s')} to save the splits file locally\n* ${chalk.cyan('u')} to upload the splits file to splits.io`);
                }
            }
        } else if (str === config.hotkeys.undo) {
            if (View.timer.timer.running === true && View.timer.lap !== 0) {
                View.timer.undo();
            }
        } else if (str === config.hotkeys.skip) {
            if (View.timer.timer.running === true && View.timer.lap < View.timer.segments.length - 1) {
                View.timer.skip();
            }
        } else if (str === config.hotkeys.pause) {

        } else if (str === config.hotkeys.reset) {

        }
    // ...when the timer is done
    } else if (status.state === 'timer-stop') {
        if (str === 'r') {

        } else if (str === 'g') {

        } else if (str === 'p') {

        } else if (str === 's') {

        } else if (str === 'u') {

        }
    }
});

// Default configuration file
const defaultConfig = {
    "hotkeys": {
        "split": "s",
        "pause": "p",
        "reset": "r",
        "skip": "n",
        "undo": "b"
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
        "timer": "S.mm",
        "splits": "M:SS",
        "deltas": "S.m"
    },
    "splitsPath": `${dirname}splits`
}

// Check for config file
if (!fs.existsSync(`${dirname}config.json`)) {
    fs.writeFileSync(`${dirname}config.json`, JSON.stringify(defaultConfig, null, 4));
}
export const config = JSON.parse(fs.readFileSync(`${dirname}config.json`));

// Check for splits folder
if (!fs.existsSync('./splits') && config.splitsPath === `${dirname}splits`) {
    fs.mkdirSync('./splits');
}

// Splash screen
const splash = () => {
    status.state = 'splash';
    clear();
    console.log(chalk.green(figlet.textSync('chronode', { font: "Speed" })));
    console.log(`Version 0.0.1`);
    console.log(`\nPress...\n* ${chalk.cyan('n')} to create new splits\n* ${chalk.cyan('l')} to load existing splits\n* ${chalk.cyan('r')} to connect to a race on racetime.gg\n* ${chalk.cyan('h')} for help`);
}
splash();