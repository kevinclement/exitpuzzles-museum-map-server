const path = require('path');
const ImageJS = require('imagejs');
let bitmap = new ImageJS.Bitmap();
var pixels = require('./pixels');
const waveshare7in5Driver = require('bindings')('waveshare7in5.node');

module.exports = class PaperDevice {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger;
        this.logPrefix = 'device: paper: ';
        this.curImg = '';

        this.code = [];
        this.legend = [];
    }

    async load() {
        this.reset();
    }

    async reset() {
        this.logger.log(this.logPrefix + 'Resetting paper device...')

        // load the images and convert them to proper pixel arrays
        this.logger.log(this.logPrefix + 'Loading code.jpg...')
        await bitmap.readFile(path.join(__dirname, '../images/code.jpg'));
        this.code = Buffer.from(pixels.getHexaPixelArray(bitmap));

        this.logger.log(this.logPrefix + 'Loading legend.jpg...');
        await bitmap.readFile(path.join(__dirname, '../images/legend.jpg'));
        this.legend = Buffer.from(pixels.getHexaPixelArray(bitmap));

        this.logger.log(this.logPrefix + 'Initializing e-paper display...');
        waveshare7in5Driver.dev_init();
        waveshare7in5Driver.init();  
    }

    displayCode() {
        this.ref.update({ image: 'code' });
        
        if (this.curImg == 'code') {
            this.logger.log(this.logPrefix + 'code already displayed.  Ignoring.');
            return;
        }        
        this.curImg = 'code';

        // micro-opt: let db update happen before triggering paper update since
        // it kind of hangs the device.  Ideally this would be a fork or something better
        setTimeout(() => {
            waveshare7in5Driver.display(this.code);    
        }, 0);
     }
 
     displayLegend() {
        this.ref.update({ image: 'legend' });

        if (this.curImg == 'legend') {
            this.logger.log(this.logPrefix + 'legend already displayed.  Ignoring.');
            return;
        }        
        this.curImg = 'legend';

        // micro-opt: let db update happen before triggering paper update since
        // it kind of hangs the device.  Ideally this would be a fork or something better
        setTimeout(() => {
            waveshare7in5Driver.display(this.legend);
        }, 0);
     }
}