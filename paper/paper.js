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
        this.code = Buffer.from(pixels.getHexaPixelArray(bitmap));

        this.logger.log(this.logPrefix + 'Loading legend.jpg...');
        await bitmap.readFile('./images/legend.jpg');
        this.legend = Buffer.from(pixels.getHexaPixelArray(bitmap));

        this.logger.log(this.logPrefix + 'Initializing e-paper display...');
        waveshare7in5Driver.dev_init();
        waveshare7in5Driver.init();  
    }

    displayCode() {
        this.ref.update({ image: 'code' });

        // micro-opt: let db update happen before triggering paper update since
        // it kind of hangs the device.  Ideally this would be a fork or something better
        setTimeout(() => {
            waveshare7in5Driver.display(this.code);    
        }, 0);
     }
 
     displayLegend() {
        this.ref.update({ image: 'legend' });

        // micro-opt: let db update happen before triggering paper update since
        // it kind of hangs the device.  Ideally this would be a fork or something better
        setTimeout(() => {
            waveshare7in5Driver.display(this.legend);
        }, 0);
     }
}