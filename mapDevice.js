const Paper = require('./paper/paper');

module.exports = class MapDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger
        this.logPrefix = 'device: map: '

        this.paper = new Paper({
            ...opts
        })

        this.magnets = new (require('./magnetController'))({ 
            ...opts
        })

        this.magnets.on('solved', () => {
            console.log(`solved: ${this.magnets.solved}`)
        })

        this.magnets.on('unsolved', () => {
            console.log(`unsolved: ${this.magnets.solved}`)
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
}