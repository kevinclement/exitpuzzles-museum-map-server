const Paper = require('./paper/paper');

const TIME_TO_WAIT_RESET_S = 10;

module.exports = class MapDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger;
        this.run = opts.run;
        this.logPrefix = 'device: map:';
        
        this.resetTimer = null;
        this.force = false;

        this.paper = new Paper({
            ...opts
        })

        this.magnets = new (require('./magnetController'))({ 
            ...opts
        })

        this.audio = new (require('./audio'))({ logger: opts.logger })

        this.magnets.on('solved', () => {           
            this.logger.log(`${this.logPrefix} SOLVED from magnets.`);

            // if we we going to reset the display but then saw a solve,
            // cancel the timer, no need to refresh display since it should be solved
            if (this.resetTimer) {
                this.logger.log(`${this.logPrefix} canceling reset timer since re-solved.`);
                clearTimeout(this.resetTimer);
            } else {
                this.solved();
            }           
        })

        this.magnets.on('unsolved', () => {
            this.logger.log(`${this.logPrefix} UNSOLVED from magnets.`);

            // only schedule a reset of the display if there wasn't a force
            if (!this.force) {
                this.resetTimer = setTimeout(()=> {
                    this.logger.log(`${this.logPrefix} resetting map after unsolved timeout.`);
                    this.reset();
                }, 1000 * TIME_TO_WAIT_RESET_S);
            }
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

    solved() {
        this.audio.play('sharpwin_combo.wav');
        this.displayCode();
        this.run.mapSolved(this.force);
    }

    forceSolve() {
        this.logger.log(this.logPrefix + ' forcing map solved.');
        this.force = true;
        this.solved();
    }

    reset() {
        this.logger.log(this.logPrefix + ' resetting device state.')
        this.force = false;
        this.resetTimer = null;
        this.paper.reset();
        this.displayLegend();
        this.magnets.reset();
    }
}