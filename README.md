# chronode
Command-line-based speedrunning timer

## Features
* Uses the [Splits.io Exchange Format](https://splits.io/timers/exchange) for splits
* Can download and upload splits from [Splits.io](https://splits.io/)
* Can connect to a race on [racetime.gg](https://racetime.gg/) and have the timer start and stop automatically

## Installation
```
git clone git@github.com:slashinfty/chronode.git
cd chronode
npm i
npm link
```

Alternatively:
```
npm i -g @slashinfty/chronode
```

Then you can use `chronode` in your terminal emulator/command line prompt.

## Configuration
Configuration file is located in the installation folder as `config.json`. It is generated on the initial running of the program, and defaults can be restored by deleting the file and running the program.

What can be configured?
* Colors for the timer (possibilities listed [https://github.com/chalk/chalk#colors](here))
* Hotkeys while the timer is active
* Displayed precision of times
* Location of local splits (.json files)