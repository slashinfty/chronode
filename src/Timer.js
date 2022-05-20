// Import modules
import { AsciiTable3 } from 'ascii-table3';
import chalk from 'chalk';
import clear from 'console-cls';
import figlet from 'figlet';
import { parse, toSeconds } from 'iso8601-duration';
import logUpdate from 'log-update';
import Stopwatch from 'notatimer';
import WebSocket from 'ws';

// Import files
import { config, status } from '../index.js';
import { splits } from './Splits.js';

// Function to change milliseconds to a readable format based on format
const msToReadable = (total, format) => {
    const leadingZeros = (num, zeros = 2) => ((new Array(zeros)).fill('0').join('') + num.toString()).slice(-1 * zeros);
    const totalMS = Math.abs(total);
    const hr = Math.floor(totalMS / 3600000);
    const min = Math.floor(totalMS / 60000) - (hr * 60);
    const sec = Math.floor(totalMS / 1000) - (hr * 3600) - (min * 60);
    const ms = Math.floor(totalMS - (hr * 3600000) - (min * 60000) - (sec * 1000));
    let str = total < 0 ? '-' : '';
    if (hr > 0 || format.includes('H')) {
        if (format.includes('HH')) {
            str += `${leadingZeros(hr)}:`;
        } else {
            str += `${hr}:`;
        }
    }
    if (min > 0 || format.includes('M')) {
        if (format.includes('MM') || hr > 0) {
            str += `${leadingZeros(min)}:`;
        } else {
            str += `${min}:`;
        }
    } 
    if (sec > 0 || format.includes('S')) {
        if (format.includes('SS') || hr > 0 || min > 0) {
            str += `${leadingZeros(sec)}`;
        } else {
            str += `${sec}`;
        }
    }
    if (format.includes('mmm')) {
        str += `.${leadingZeros(ms, 3)}`;
    } else if (format.includes('mm')) {
        str += `.${leadingZeros(Math.floor(ms / 10))}`;
    } else if (format.includes('m')) {
        str += `.${Math.floor(ms / 100).toString()}`;
    }
    return str;
}

// Timer
export class Timer {
    constructor() {
        this.title = `${splits.game.longname} - ${splits.category.longname}`;
        this.timer = new Stopwatch({
            callback: (data) => logUpdate(chalk[config.colors.timer](figlet.textSync(msToReadable(data.time, config.precision.timer), { font: "Modular" })))
        });
        this.lap = -1;
        this.race = false;
        this.segments = splits.segments.map(seg => ({
            "name": seg.name,
            "prevSplit": seg.endedAt.realtimeMS,
            "bestSegment": seg.bestDuration.realtimeMS,
            "currSplit": null,
            "currSegment": null,
            "splitDelta": null,
            "segmentDelta": null,
            "isSkipped": seg.isSkipped
        }));

        if (splits.offset > 0) {
            this.timer.time = splits.offset; 
        }
    }

    // Printing the table
    table() {
        clear();
        const table = new AsciiTable3(chalk[config.colors.headers](this.title))
        .setHeading(chalk[config.colors.headers]('Name'), chalk[config.colors.headers]('Delta'), chalk[config.colors.headers]('Split'), chalk[config.colors.headers]('Save'))//['Name', 'Delta', 'Split', 'Save'].map(head => (head)))
        .addRowMatrix(this.segments.map((seg, index) => {
            const arr = [];
            // Name
            arr.push(seg.name);
            // Delta
            if (seg.currSplit === null || seg.prevSplit === null || seg.isSkipped) {
                arr.push('');
            } else if (seg.splitDelta < 0) {
                arr.push(chalk[config.colors.ahead](`-${msToReadable(Math.abs(seg.splitDelta), config.precision.deltas)}`));
            } else {
                arr.push(chalk[config.colors.behind](`+${msToReadable(seg.splitDelta, config.precision.deltas)}`));
            }
            // Split
            if (seg.isSkipped || (seg.prevSplit === null && seg.currSplit === null)) {
                arr.push(chalk[config.colors.times]('---'));
            } else if (seg.prevSplit === null && seg.currSplit !== null) {
                arr.push(chalk[config.colors.times](msToReadable(seg.currSplit, config.precision.splits)));
            } else if (seg.currSplit === null) {
                arr.push(chalk[config.colors.times](msToReadable(seg.prevSplit, config.precision.splits)));
            } else {
                if (seg.splitDelta < 0) {
                    arr.push(chalk[config.colors.ahead](msToReadable(seg.currSplit, config.precision.splits)));
                } else {
                    arr.push(chalk[config.colors.behind](msToReadable(seg.currSplit, config.precision.splits)));
                }
            }
            // Save
            if (seg.bestSegment === null || seg.isSkipped || (index > 0 && this.segments[index - 1].isSkipped)) {
                arr.push(chalk[config.colors.times]('---'));
            } else if (seg.currSegment === null) {
                const prevSegmentSplit = index === 0 ? 0 : this.segments[index - 1].prevSplit;
                const potential = seg.prevSplit - prevSegmentSplit - seg.bestSegment;
                arr.push(chalk[config.colors.times](msToReadable(potential, config.precision.deltas)));
            } else {
                const prevSegmentSplit = index === 0 ? 0 : this.segments[index - 1].prevSplit;
                const potential = seg.prevSplit - prevSegmentSplit - seg.bestSegment;
                if (seg.segmentDelta < 0) {
                    arr.push(chalk[config.colors.best](`-${msToReadable(Math.abs(seg.segmentDelta), config.precision.deltas)}`));
                } else if (seg.segmentDelta < potential) {
                    arr.push(chalk[config.colors.ahead](msToReadable(seg.segmentDelta, config.precision.deltas)));
                } else {
                    arr.push(chalk[config.colors.behind](msToReadable(seg.segmentDelta, config.precision.deltas)))
                }
            }
            return arr;
        }));
        // Table settings
        table.setCellMargin(3);
        table.setTitleAlignCenter();
        table.setAlignCenter(2);
        table.setAlignCenter(3);
        table.setAlignCenter(4);
        console.log(table.toString());
        console.log(chalk[config.colors.timer](figlet.textSync(msToReadable(this.timer.time, config.precision.timer), { font: "Modular" })))
    }

    // Starting the timer
    start() {
        splits.attempts.total = splits.attempts.total + 1;
        this.timer.start();
        this.lap = 0;
    }

    // Splitting
    split(time = null) {
        let timeData;
        if (time === null) {
            timeData = this.lap === this.segments.length - 1 ? this.timer.stop() : this.timer.lap();
        } else {
            timeData = time;
            this.timer.stop();
        }
        const segment = this.segments[this.lap];
        segment.currSplit = timeData.time;
        segment.currSegment = this.lap === 0 ? segment.currSplit : segment.currSplit - this.segments[this.lap - 1].currSplit;
        segment.splitDelta = segment.currSplit - segment.prevSplit;
        segment.segmentDelta = segment.currSegment - segment.bestSegment;
        this.lap++;
        this.table();
    }

    // Undoing a split
    undo() {
        this.lap--;
        const segment = this.segments[this.lap];
        Object.assign(segment, {
            "currSplit": null,
            "currSegment": null,
            "splitDelta": null,
            "segmentDelta": null,
            "isSkipped": splits.segments[this.lap].isSkipped
        });
        this.table();
    }

    // Skipping a split
    skip() {
        const segment = this.segments[this.lap];
        segment.isSkipped = true;
        this.lap++;
        this.table();
    }

    // Resetting the timer
    reset() {
        this.timer.reset();
        this.lap = -1;
        this.segments = splits.segments.map(seg => ({
            "name": seg.name,
            "prevSplit": seg.endedAt.realtimeMS,
            "bestSegment": seg.bestDuration.realtimeMS,
            "currSplit": null,
            "currSegment": null,
            "splitDelta": null,
            "segmentDelta": null,
            "isSkipped": seg.isSkipped
        }));
        this.table();
    }

    // Save any new best segments
    saveBests() {
        this.segments.forEach((seg, index) => {
            if (seg.currSegment < seg.bestSegment || seg.bestSegment === null) {
                splits.segments[index].bestDuration.realtimeMS = seg.currSegment;
            }
        });
    }

    // Save the run
    saveRun() {
        this.segments.forEach((seg, index) => splits.segments[index].endedAt.realtimeMS = seg.currSplit);
        this.segments.forEach((seg, index) => {
            if (seg.bestSegment === null) {
                splits.segments[index].bestDuration.realtimeMS = seg.currSegment;
            }
        });
        this.saveBests();
    }
}

// Race handling timer
export class RaceTime extends Timer {
    constructor(race, user) {
        super();
        this.name = race.name;
        this.user = user;
        this.connection = new WebSocket(new URL(race.websocket_url, `wss://racetime.gg`));
        this.started = false;
        this.race = true;

        this.connection.onmessage = msg => {
            const data = JSON.parse(msg.data);
            if (data.type !== 'race.data') {
                return;
            }
            if (data.race.status.value === 'open') {
                this.timer.set({
                    "initial": -1000 * toSeconds(parse(data.race.start_delay))
                });
                this.table();
                return;
            }
            if (['in_progress', 'pending'].includes(data.race.status.value) && !this.started) {
                this.started = true;
                status.state = 'timer';
                this.lap = 0;
                this.timer.start();
                return;
            } else if (['finished', 'canceled'].includes(data.race.status.value)) {
                this.timer.stop();
                status.state = 'timer-stop';
                console.log(`\nPress...\n* ${chalk.cyan('r')} to reset the timer\n* ${chalk.cyan('g')} to save any new best segments\n* ${chalk.cyan('p')} to save the current run as a personal best\n* ${chalk.cyan('s')} to save the splits file locally\n* ${chalk.cyan('u')} to upload the splits file to splits.io\n* ${chalk.cyan('l')} to load new splits`);
                return;
            }
            const racer = data.race.entrants.find(entrant => entrant.user.name === this.user);
            if (racer.status.value === 'done') {
                const parsedTime = parse(racer.finish_time);
                this.timer.time = toSeconds(parsedTime) * 1000;
                this.timer.times = [parsedTime.hours, parsedTime.minutes, Math.floor(parsedTime.seconds), (parsedTime.seconds - Math.floor(parsedTime.seconds)) * 1000];
                this.connection.close();
                this.split({
                    time: this.timer.time,
                    times: this.timer.times
                });
                status.state = 'timer-stop';
                console.log(`\nPress...\n* ${chalk.cyan('r')} to reset the timer\n* ${chalk.cyan('g')} to save any new best segments\n* ${chalk.cyan('p')} to save the current run as a personal best\n* ${chalk.cyan('s')} to save the splits file locally\n* ${chalk.cyan('u')} to upload the splits file to splits.io\n* ${chalk.cyan('m')} to return to the main menu`);
            } else if (['dnf', 'dq'].includes(racer.status.value)) {
                this.timer.stop();
                status.state = 'timer-stop';
                console.log(`\nPress...\n* ${chalk.cyan('r')} to reset the timer\n* ${chalk.cyan('g')} to save any new best segments\n* ${chalk.cyan('p')} to save the current run as a personal best\n* ${chalk.cyan('s')} to save the splits file locally\n* ${chalk.cyan('u')} to upload the splits file to splits.io\n* ${chalk.cyan('m')} to return to the main menu`);
            }
        }
    }
}