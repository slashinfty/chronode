import logUpdate from 'log-update';
import * as readline from 'node:readline';
import Timer from 'notatimer';

readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

const timer = new Timer({callback: (time) => logUpdate(`${time.time}`)});

process.stdin.on('keypress', (str, key) => {
    if ([`\x03`, `\x04`, `\x1B`].includes(key.sequence)) {
        process.exit(1);
    }
    if (str === 's') {
        timer.start();
    }
    if (str === 'q') {
        timer.stop();
    }
    //console.log(str);
    console.log(key);
});