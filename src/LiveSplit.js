import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from "fast-xml-parser";

import { config } from '../index.js';
import { splits } from './Splits.js';

const readableToMs = timeStr => {
    const decSplit = timeStr.split(`.`);
    const colonSplit = decSplit[0].split(`:`);
    let ms = 0;
    if (decSplit.length === 2) {
        const pad = `${decSplit[1]}00`;
        ms += parseInt(pad.slice(0, 3));
        ms += parseInt(pad.slice(3)) * 10 ** (-1 * pad.length + 3);
    }
    for (let i = 0; i < colonSplit.length; i++) {
        ms += parseInt(colonSplit[i]) * 1000 * (60 ** (colonSplit.length - 1 - i));
    }
    return ms;
}

export const livesplit = (file) => {
    const parser = new XMLParser();
    const data = parser.parse(fs.readFileSync(`${config.splitsPath}/${file}`));
    const run = data.Run;
    splits.game.longname = run.GameName;
    splits.category.longname = run.CategoryName;
    splits.attempts.total = run.AttemptCount;
    splits.offset = readableToMs(run.Offset.replace('-', ''));
    const segments = run.Segments.Segment;
    splits.segments = segments.map(seg => ({
        "name": seg.Name,
        "endedAt": {
            "realtimeMS": seg.SplitTimes.SplitTime !== '' ? readableToMs(seg.SplitTimes.SplitTime.RealTime) : null
        },
        "bestDuration": {
            "realtimeMS": seg.BestSegmentTime !== '' ? readableToMs(seg.BestSegmentTime.RealTime) : null
        },
        "isSkipped": seg.SplitTimes.SplitTime === '' 
    }));
    splits.fileName = file.replace('.lss', '');
    fs.writeFileSync(path.resolve(config.splitsPath, `${splits.fileName}.json`), JSON.stringify(splits, null, 4));
}