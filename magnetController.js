var gpio = require('rpi-gpio');
var Magnet = require('./magnet');

const PIN_MAP = {
    'seattle': 12,
    'india': 16
};

module.exports = class MagnetController {
    constructor(opts) {
        this.ref = opts.ref;
        this.logger = opts.logger
        this.logPrefix = 'magnet: '
        
        this.magnets = {};

        gpio.setMode(gpio.MODE_BCM);

        gpio.on('change', (pin, value) => {
            this.magnetStateChanged(pin, value);
        });

        this.setupMagnet('seattle');
        this.setupMagnet('india');
        
        // TODO: I don't think I need to track this like this
        // instead I probably want db to be tracking any overrides
        this.ref.child('magnets').on('value', (snapshot) => {
            console.log('magnets updated from db');

            let mags = snapshot.val();

            this.magnets[PIN_MAP['seattle']].db = mags['seattle'];
            this.magnets[PIN_MAP['india']].db = mags['india'];
        });        
    }

    setupMagnet(location) {
        let pin = PIN_MAP[location];
        this.magnets[pin] = new Magnet(pin, location);

        // do initial read of pin, then setup pin for onChange, otherwise if magnet
        // is in place when you boot it will never see the real value without it being changed
        gpio.setup(pin, gpio.DIR_IN, (err) => {
            if (err) throw err;

            gpio.read(pin, (err, value) => {
                if (err) throw err;

                this.magnetStateChanged(pin, value);
                gpio.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH);
            });
        });
    }

    magnetStateChanged(pin, newValue) {
        let mag = this.magnets[pin];
        
        // flip state value as it aligns more to what I think of as 'on'
        //   e.g. false means there is a magnet, I actually want true to mean that
        mag.value = !newValue;

        this.logger.log(`${this.logPrefix}[${pin}]: ${mag.location} => ${mag.value}, db => ${mag.db}`)

        // update database to match
        this.ref.child('magnets').child(mag.location).set(mag.value)

        // TODO: check for solved state
    }
}