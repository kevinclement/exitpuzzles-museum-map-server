'use strict';

const ImageJS = require('imagejs');
let bitmap = new ImageJS.Bitmap();
var pixels = require('./pixels');
const waveshare7in5Driver = require('bindings')('waveshare7in5.node');

module.exports = {
	code: [],
    legend: [],

    load: async function () {

        // load the images and convert them to proper pixel arrays
        console.log('Loading code.jpg...');
        await bitmap.readFile('./images/code.jpg');
        this.code = pixels.getHexaPixelArray(bitmap);

        console.log('Loading legend.jpg...');
        await bitmap.readFile('./images/legend.jpg');
        this.legend = pixels.getHexaPixelArray(bitmap);

        console.log('Initializing e-paper display...');
        waveshare7in5Driver.dev_init();
        waveshare7in5Driver.init();  
    },

    displayCode: function () {
       waveshare7in5Driver.display(Buffer.from(this.code));
    },

    displayLegend: function () {
        waveshare7in5Driver.display(Buffer.from(this.legend));
    }
};