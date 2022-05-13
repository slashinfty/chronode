import { URL } from 'url';
import clear from 'console-cls';
import chalk from 'chalk';
import figlet from 'figlet';

// Import files
import { config, rl } from '../index.js';
import { state } from './State.js';
import { splits } from './Splits.js';

const msToReadable = (ms, precision) => {

}

const readableToMs = timeStr => {

}

export const create = async () => {
    state.status = 'create';
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
        //create segment and add
    }
}

export const help = () => {
    state.status = 'help';
    clear();
    console.log(`Config file is located at ${chalk.green(new URL('.', import.meta.url).pathname.replace(`src/`, `config.json`))}`);
    console.log(`\nCurrent hotkeys:`);
    console.log(`\n* ${chalk.cyan(config.hotkeys.split)} - start timer/split\n* ${chalk.cyan(config.hotkeys.pause)} - pause the timer\n* ${chalk.cyan(config.hotkeys.reset)} - reset the timer\n* ${chalk.cyan(config.hotkeys.skip)} - skip the current split\n* ${chalk.cyan(config.hotkeys.undo)} - undo the previous splits\n* ${chalk.cyan(config.hotkeys.quit)} - quit the timer`);
    console.log(`\nCurrent colors:`);
    console.log(`\n* Headers - ${chalk[config.colors.headers](config.colors.headers)}\n* Names - ${chalk[config.colors.names](config.colors.names)}\n* Times - ${chalk[config.colors.times](config.colors.times)}\n* Timer - ${chalk[config.colors.timer](config.colors.timer)}\n* Ahead of best - ${chalk[config.colors.ahead](config.colors.ahead)}\n* Behind best - ${chalk[config.colors.behind](config.colors.behind)}\n* Best segment - ${chalk[config.colors.best](config.colors.best)}`)
    console.log(`\nMore information can be found at ${chalk.green('https://github.com/slashinfty/chronode')}`);
    console.log(`\nPress any key to return...`);
}

export const load = () => {

}

export const race = () => {

}

export const timer = () => {

}