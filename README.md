# chronode
Command-line-based speedrunning timer

![splash screen for the timer](https://i.ibb.co/DLdcSsG/Screenshot-20220522-130558.png)

![timer actively running](https://i.ibb.co/n8SVT9w/Screenshot-20220522-130803.png)

Current version: 0.0.7

This is considered beta. If you have a question on functionality or want to suggest a feature, use [Discussions](https://github.com/slashinfty/chronode/discussions). If you encounter a bug or problem with the timer, open an [Issue](https://github.com/slashinfty/chronode/issues).

### Future Feature List
* Save run history

## Features
* Uses the [Splits.io Exchange Format](https://splits.io/timers/exchange) for splits
* Converts existing LiveSplit files into Splits.io Exchange Format files
* Can download and upload splits from [Splits.io](https://splits.io/)
* Can connect to a race on [racetime.gg](https://racetime.gg/) and have the timer start and stop automatically

## Installation

Requires Node.js >= v17.9
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

**Note:** splits files (.json or .lss) must be placed in the folder indicated in `config.json`. More info below.

## Configuration
Configuration file is located in the installation folder as `config.json`. It is generated on the initial running of the program, and defaults can be restored by deleting the file and running the program.

What can be configured?
* Colors for the timer (possibilities listed [here](https://github.com/chalk/chalk#colors))
* Hotkeys while the timer is active (in order to identify potential hotkeys, use [this](https://gist.github.com/slashinfty/f122d5f5430037c4b6347e0a3daee8f8) script)
* Displayed precision of times
* Location of local splits (.json files)

## Discussion

You can discuss this repository more in my [Discord](https://discord.gg/Q8t9gcZ77s).
