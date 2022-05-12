#!/usr/bin/env node

import * as readline from 'node:readline';
import chalk from 'chalk';

// Import files
import { state } from './src/state.js';

// Read keypresses during process life
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);

// Keypresses for exiting and splash screen
process.stdin.on('keypress', (str, key) => {
    // To abruptly exit the program: ctrl+c or ctrl+d
    if ([`\x03`, `\x04`].includes(key.sequence)) {
        process.exit(1);
    }
    // To safely exit the program: esc
    if (key.sequence === `\x1B`) {
        // prompt to save?
        process.exit(1);
    }
    // Splash screen options
    if (state.status === 'splash') {
        if (str === 'n') {

        } else if (str === 'l') {

        } else if (str === 'h') {

        }
    }
});

// Splash screen
// title
console.log(`Version 0.0.1 (dd MMM yyyy)`);
// press...