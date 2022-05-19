# chronode
Command-line-based speedrunning timer

Current version: 0.0.1

This is considered alpha. If you have a question on functionality or want to suggest a feature, use [Discussions](https://github.com/slashinfty/chronode/discussions). If you encounter a bug or problem with the timer, open an [Issue](https://github.com/slashinfty/chronode/issues).

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
