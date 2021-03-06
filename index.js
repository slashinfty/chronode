#!/usr/bin/env node

// Import modules
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'node:readline';
import * as readlinePromises from 'node:readline/promises';
import { URL } from 'url';
import { fileURLToPath } from 'node:url';
import clear from 'console-cls';
import chalk from 'chalk';
import figlet from 'figlet';

// Import files
import { splits } from './src/Splits.js';
import { upload } from './src/SplitsIO.js';
import * as View from './src/Views.js';

// ESM __dirname
export const dirname = fileURLToPath(import.meta.url).replace('index.js', '');

// Readline
export const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout
});

export const status = {
    "state": "splash",
    "raceInfo": {}
};

// Read keypresses during process life
readline.emitKeypressEvents(rl.input);
rl.input.setRawMode(true);

// Handling keypresses
rl.input.on('keypress', async (str, key) => {
    // To exit the program: ctrl+c or ctrl+d or esc
    if ([`\x03`, `\x04`, `\x1B`].includes(key.sequence)) {
        process.exit(1);
    }
    // Ignore keypresses
    if (status.state === 'wait') {
        return;
    }
    // Keys to accept...
    // ...during plash screen
    if (status.state === 'splash') {
        if (key.name === 'n') {
            View.create();
        } else if (key.name === 'l') {
            status.state = 'load-before';
            clear();
            console.log(`Press ${chalk.cyan('l')} for local file or ${chalk.cyan('s')} for splits.io`);
        } else if (key.name === 'r') {
            View.race();
        } else if (key.name === 'h') {
            View.help();
        }
    // ...during help screen
    } else if (status.state === 'help') {
        splash();
    // ...when ready to load to the timer
    } else if (status.state === 'ready') {
        console.log(status.raceInfo);
        if (Object.keys(status.raceInfo).length > 0) {
            View.activeRace();
        } else {
            View.active();
        }
    // ...to determine how to load splits
    } else if (status.state === 'load-before') {
        if (key.name === 'l') {
            View.load('local');
        } else if (key.name === 's') {
            View.load('splitsio');
        }
    // ...while the timer is active
    } else if (status.state === 'timer') {
        if (key.name === config.hotkeys.split) {
            if (View.timer.timer.running === false && View.timer.timer.started === false) {
                View.timer.start();
            } else if ((View.timer.race === true && View.timer.lap < View.timer.segments.length - 1) || (View.timer.race === false && View.timer.lap < View.timer.segments.length)) {
                View.timer.split();
                if (View.timer.lap === View.timer.segments.length) {
                    status.state = 'timer-stop';
                    console.log(`\nPress...\n* ${chalk.cyan('r')} to reset the timer\n* ${chalk.cyan('g')} to save any new best segments\n* ${chalk.cyan('p')} to save the current run as a personal best\n* ${chalk.cyan('s')} to save the splits file locally\n* ${chalk.cyan('u')} to upload the splits file to splits.io\n* ${chalk.cyan('m')} to return to the main menu`);
                }
            }
        } else if (key.name === config.hotkeys.undo) {
            if (View.timer.timer.running === true && View.timer.lap !== 0) {
                View.timer.undo();
            }
        } else if (key.name === config.hotkeys.skip) {
            if (View.timer.timer.running === true && View.timer.lap < View.timer.segments.length - 1) {
                View.timer.skip();
            }
        } else if (key.name === config.hotkeys.pause) {
            View.timer.timer.pause();

        } else if (key.name === config.hotkeys.reset) {
            if (View.timer.timer.started) {
                View.timer.timer.stop();
                if (View.timer.segments.some(seg => seg.currSegment !== null && seg.currSegment < seg.bestSegment)) {
                    status.state = 'reset-check';
                    console.log(`\nDo you want to save your new best segments? Press ${chalk.cyan('y')} or ${chalk.cyan('n')}.`);
                } else {
                    View.timer.reset();
                }
            }
        } else if (key.name === config.hotkeys.quit) {
            View.timer.timer.stop();
            status.state = 'timer-stop';
            console.log(`\nPress...\n* ${chalk.cyan('r')} to reset the timer\n* ${chalk.cyan('g')} to save any new best segments\n* ${chalk.cyan('p')} to save the current run as a personal best\n* ${chalk.cyan('s')} to save the splits file locally\n* ${chalk.cyan('u')} to upload the splits file to splits.io\n* ${chalk.cyan('m')} to return to the main menu`);
        }
    // ...when the timer is done
    } else if (status.state === 'timer-stop') {
        if (key.name === 'r') {
            View.timer.reset();
            status.state = 'timer';
        } else if (key.name === 'g') {
            View.timer.saveBests();
            console.log('Best segments saved.')
        } else if (key.name === 'p') {
            View.timer.saveRun();
            console.log('Run saved.')
        } else if (key.name === 's') {
            fs.writeFileSync(`${config.splitsPath}/${splits.fileName}.json`, JSON.stringify(splits, null, 4));
            console.log('File saved.');
        } else if (key.name === 'u') {
            fs.writeFileSync(`${config.splitsPath}/${splits.fileName}.json`, JSON.stringify(splits, null, 4));
            const resp = await upload();
            console.log(resp);
        } else if (key.name === 'm') {
            splash();
        }
    // ...before reseting
    } else if (status.state === 'reset-check') {
        if (key.name === 'y') {
            View.timer.saveBests();
            View.timer.reset();
        } else if (key.name === 'n') {
            View.timer.reset();
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
        "timer": "S.mm",
        "splits": "M:SS",
        "deltas": "S.m"
    },
    "splitsPath": path.resolve(dirname, 'splits')
}

// Check for config file
if (!fs.existsSync(path.resolve(dirname, 'config.json'))) {
    fs.writeFileSync(path.resolve(dirname, 'config.json'), JSON.stringify(defaultConfig, null, 4));
}
export const config = JSON.parse(fs.readFileSync(path.resolve(dirname, 'config.json')));

// Check for splits folder
if (!fs.existsSync(path.resolve(dirname, 'splits')) && config.splitsPath === path.resolve(dirname, 'splits')) {
    fs.mkdirSync(path.resolve(dirname, 'splits'));
}

// Splash screen
const splash = () => {
    status.state = 'splash';
    clear();
    console.log(chalk.green(figlet.textSync('chronode', { font: "Speed" })));
    console.log(`Version 0.0.7`);
    console.log(`\nPress...\n* ${chalk.cyan('n')} to create new splits\n* ${chalk.cyan('l')} to load existing splits\n* ${chalk.cyan('r')} to connect to a race on racetime.gg\n* ${chalk.cyan('h')} for help`);
    console.log(`\nYou can exit any time by pressing ${chalk.cyan('esc')}`);
}
splash();