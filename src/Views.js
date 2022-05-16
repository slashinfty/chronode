// Import modules
import * as fs from 'fs';
import clear from 'console-cls';
import chalk from 'chalk';
import fetch from 'node-fetch';

// Import files
import { config, dirname, rl, status } from '../index.js';
import { splits } from './Splits.js';
import { Timer } from './Timer.js';

// Timer export
export var timer = null;

// Function to change readable time to milliseconds
const readableToMs = timeStr => {
    const decSplit = timeStr.split(`.`);
    const colonSplit = decSplit[0].split(`:`);
    let ms = decSplit.length === 2 ? parseInt(decSplit[1]) : 0;
    for (let i = colonSplit.length - 1; i > -1; i--) {
        ms += parseInt(colonSplit[i]) * 1000 * (60 ** (2 - i));
    }
    return ms;
}

// Creating new splits
export const create = async () => {
    status.state = 'wait';
    rl.clearLine(0);
    clear();
    const game = await rl.question(`Game name: `);
    splits.game.longname = game;
    const category = await rl.question('Category name: ');
    splits.category.longname = category;
    const runner = await rl.question(`Runner name: `);
    splits.runners[0].longname = runner;
    const segmentCount = await rl.question(`Number of segments: `);
    for (let i = 0; i < segmentCount; i++) {
        console.log(chalk.magentaBright(`Segment #${i + 1}`));
        const name = await rl.question('Segment name: ');
        const splitTime = await rl.question('Split time: ');
        const bestTime = await rl.question('Best segment time: ');
        const segment = {
            "name": name,
            "endedAt": {
                "realtimeMS": splitTime === '' ? null : readableToMs(splitTime)
            },
            "bestDuration": {
                "realtimeMS": bestTime === '' ? null : readableToMs(bestTime)
            },
            "isSkipped": false
        }
        splits.segments.push(segment);
    }
    const fileName = await rl.question(`Enter file name: `);
    splits.fileName = fileName;
    fs.writeFileSync(`${config.splitsPath}/${fileName}.json`, JSON.stringify(splits, null, 4));
    status.state = 'ready';
    console.log(`\nPress any key to continue...`);
}

// Help screen
export const help = () => {
    status.state = 'help';
    clear();
    console.log(`Config file is located at ${chalk.green(`${dirname}config.json`)}`);
    console.log(`\nCurrent hotkeys:`);
    console.log(`\n* ${chalk.cyan(config.hotkeys.split)} - start timer/split\n* ${chalk.cyan(config.hotkeys.pause)} - pause the timer\n* ${chalk.cyan(config.hotkeys.reset)} - reset the timer\n* ${chalk.cyan(config.hotkeys.skip)} - skip the current split\n* ${chalk.cyan(config.hotkeys.undo)} - undo the previous splits\n* ${chalk.cyan(config.hotkeys.quit)} - quit the timer`);
    console.log(`\nCurrent colors:`);
    console.log(`\n* Headers - ${chalk[config.colors.headers](config.colors.headers)}\n* Names - ${chalk[config.colors.names](config.colors.names)}\n* Times - ${chalk[config.colors.times](config.colors.times)}\n* Timer - ${chalk[config.colors.timer](config.colors.timer)}\n* Ahead of best - ${chalk[config.colors.ahead](config.colors.ahead)}\n* Behind best - ${chalk[config.colors.behind](config.colors.behind)}\n* Best segment - ${chalk[config.colors.best](config.colors.best)}`);
    console.log(`\nSplits should be saved in ${chalk.green(config.splitsPath)}`);
    console.log(`\nMore information can be found at ${chalk.green('https://github.com/slashinfty/chronode')}`);
    console.log(`\nPress any key to return...`);
}

// Loading splits
export const load = async (choice) => {
    status.state = 'wait';
    rl.clearLine(0);
    clear();
    // Local file
    if (choice === 'local') {
        do {
            let input = await rl.question('Splits file name: ');
            if (input.endsWith(`.json`)) {
                input.replace('.json', '');
            }
            if (fs.existsSync(`${config.splitsPath}/${input}.json`)) {
                Object.assign(splits, JSON.parse(fs.readFileSync(`${config.splitsPath}/${input}.json`)));
                splits.fileName = input;
                break;
            } else {
                console.log(`File does not exist.\n`);
            }
        } while (true);
    // Download from splits.io
    } else if (choice === 'splitsio') {
        console.log(`The ${chalk.cyan('path')} of the URL is the end. Example: https://splits.io/${chalk.cyan('1d1d')}`);
        do {
            let input = await rl.question('Splits.io path: ');
            const res = await fetch(`https://splits.io/api/v4/runs/${input}`, { headers: { "Accept": "application/splitsio" } });
            const data = await res.json();
            if (data.status.state === 404) {
                console.log(data.error);
                continue;
            }
            Object.assign(splits, {
                "game": {
                    "longname": data.game.longname
                },
                "category": {
                    "longname": data.category.longname
                },
                "runners": data.runners.length === 0 ? [] : [
                    {
                        "longname": data.runners[0].longname
                    }
                ],
                "attempts": {
                    "total": data.attempts.total
                },
                "segments": data.segments.map(seg => ({
                    "name": seg.name,
                    "endedAt": {
                        "realtimeMS": seg.endedAt.realtimeMS
                    },
                    "bestDuration": {
                        "realtimeMS": seg.bestDuration.realtimeMS
                    },
                    "isSkipped": seg.isSkipped
                }))
            });
            const fileName = await rl.question(`Enter file name: `);
            splits.fileName = fileName;
            fs.writeFileSync(`${config.splitsPath}/${fileName}.json`, JSON.stringify(splits, null, 4));
            break;
        } while (true);
    }
    status.state = 'ready';
    console.log(`\nPress any key to continue...`);
}

export const race = () => {

}

// Starting the timer
export const active = () => {
    status.state = 'timer';
    rl.clearLine(0);
    clear();
    timer = new Timer();
    timer.table();
}