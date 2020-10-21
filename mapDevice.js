const Paper = require('./paper/paper');

module.exports = class MapDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger
        this.logPrefix = 'device: map: '

        this.paper = new Paper({
            ...opts
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