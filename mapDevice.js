const Paper = require('./paper/paper');

const TIME_TO_WAIT_RESET_S = 10;

module.exports = class MapDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger
        this.logPrefix = 'device: map:'
        this.resetTimer = null;

        this.paper = new Paper({
            ...opts
        })

        this.magnets = new (require('./magnetController'))({ 
            ...opts
        })

        this.audio = new (require('./audio'))({ logger: opts.logger })

        // TODO: should we display legend on boot?

        this.magnets.on('solved', () => {           
            console.log(`### solved: ${this.magnets.solved}`)

            // if we we going to reset the display but then saw a solve,
            // cancel the timer, no need to refresh display since it should be solved
            if (this.resetTimer) {
                this.logger.log(`${this.logPrefix} canceling reset timer since re-solved.`);
                clearTimeout(this.resetTimer);
            } else {
                this.audio.play('sharpwin_combo.wav');
                this.displayCode();
            }           
        })

        this.magnets.on('unsolved', () => {
            console.log(`### unsolved: ${this.magnets.solved}`)

            this.resetTimer = setTimeout(()=> {
                this.logger.log(`${this.logPrefix} resetting map after unsolved timeout.`);
                this.reset();
            }, 1000 * TIME_TO_WAIT_RESET_S);

        })
    }

    async load () {
        await this.paper.load();
    }

    displayLegend() {
        this.paper.displayLegend();
    }

    displayCode() {
        this.paper.displayCode();
    }

    reset() {
        this.resetTimer = null;
        this.displayLegend();
        this.magnets.reset();
    }
}