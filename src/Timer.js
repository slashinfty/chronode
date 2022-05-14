import { AsciiTable3, AlignmentEnum } from 'ascii-table3';
import chalk from 'chalk';
import clear from 'console-cls';
import figlet from 'figlet';
import logUpdate from 'log-update';
import Stopwatch from 'notatimer';

import { config } from '../index.js';

const msToReadable = (total, format) => {
    const leadingZeros = (num, zeros = 2) => ((new Array(zeros)).fill('0').join('') + num.toString()).slice(-1 * zeros);
    const hr = Math.floor(total / 3600000);
    const min = Math.floor(total / 60000) - (hr * 60);
    const sec = Math.floor(total / 1000) - (hr * 3600) - (min * 60);
    const ms = Math.floor(total - (hr * 3600000) - (min * 60000) - (sec * 1000));
    let str = '';
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

export class Timer {
    constructor(splits) {
        this.title = `${splits.game.longname} - ${splits.category.longname}`;
        this.timer = new Stopwatch({
            callback: (data) => logUpdate(chalk[config.colors.timer](figlet.textSync(msToReadable(data.time, config.precision.timer), { font: "Modular" })))
        });
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
    }

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
        table.setCellMargin(3);
        table.setTitleAlignCenter();
        table.setAlignCenter(2);
        table.setAlignCenter(3);
        table.setAlignCenter(4);
        console.log(table.toString());
        console.log(chalk[config.colors.timer](figlet.textSync(msToReadable(this.timer.time, config.precision.timer), { font: "Modular" })))
    }

    start() {
        this.timer.start();
        this.lap = 0;
    }

    splits() {

    }
}