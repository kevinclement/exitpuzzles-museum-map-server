var paper = require('./paper/paper');

module.exports = class MapDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger
        this.logPrefix = 'device: map: '
    }

    async load () {
        this.logger.log(this.logPrefix + 'inside manager async load')
        await paper.load();
        // paper.displayCode();
    }
}