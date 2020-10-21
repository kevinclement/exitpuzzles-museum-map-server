'use strict';

const ImageJS = require('imagejs');
let bitmap = new ImageJS.Bitmap();
var pixels = require('./pixels');
const waveshare7in5Driver = require('bindings')('waveshare7in5.node');

module.exports = class PaperDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger;
        this.logPrefix = 'device: paper: ';

        this.code = [];
        this.legend = [];
    }

    async load() {
        // load the images and convert them to proper pixel arrays
        this.logger.log(this.logPrefix + 'Loading code.jpg...')
        await bitmap.readFile('./images/code.jpg');
        this.code = pixels.getHexaPixelArray(bitmap);

        this.logger.log(this.logPrefix + 'Loading legend.jpg...');
        await bitmap.readFile('./images/legend.jpg');
        this.legend = pixels.getHexaPixelArray(bitmap);

        this.logger.log(this.logPrefix + 'Initializing e-paper display...');
        waveshare7in5Driver.dev_init();
        waveshare7in5Driver.init();  
    }

    displayCode() {
        waveshare7in5Driver.display(Buffer.from(this.code));
     }
 
     displayLegend() {
        waveshare7in5Driver.display(Buffer.from(this.legend));
     }
}