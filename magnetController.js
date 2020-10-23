var gpio = require('rpi-gpio');
const EventEmitter = require('events');
var Magnet = require('./magnet');

// const PIN_MAP = {
//     'spain':      12,
//     'india':      16,
//     'fiji':       19,
//     'madagascar': 13,
//     'alaska':     26,
//     'seattle':    20,
//     'argentina':  21
// };

const PIN_MAP = {
    // 'fiji':       19,
    'seattle':    20
};

module.exports = class MagnetController extends EventEmitter {
    constructor(opts) {
        super();
        this.ref = opts.ref;
        this.logger = opts.logger;
        this.logPrefix = 'magnet: ';
        
        this.magnets = {};
        this.magnetsSetup = 0;
        this.solved = false;

        gpio.setMode(gpio.MODE_BCM);

        gpio.on('change', (pin, value) => {
            this.magnetStateChanged(pin, value);
        });

        // setup all the magnets
        Object.entries(PIN_MAP).forEach(([location, pin]) => {
            this.setupMagnet(location);
        });
       
        // TODO: I don't think I need to track this like this
        // instead I probably want db to be tracking any overrides
        // this.ref.child('magnets').on('value', (snapshot) => {
        //     console.log('magnets updated from db');

        //     let mags = snapshot.val();

        //     this.magnets[PIN_MAP['seattle']].db = mags['seattle'];
        //     this.magnets[PIN_MAP['india']].db = mags['india'];
        // });
    }

    setupMagnet(location) {
        let pin = PIN_MAP[location];
        this.magnets[pin] = new Magnet(pin, location);

        gpio.setup(pin, gpio.DIR_IN, gpio.EDGE_BOTH, () => {
            this.magnetsSetup++;

            // once we've setup all the magnets, do an initial read in
            // since onChange won't fire initially
            if (this.magnetsSetup == Object.entries(PIN_MAP).length) {
                this.readAllCurrentMagnets();
            }
        });
    }

    magnetStateChanged(pin, newValue) {
        let mag = this.magnets[pin];
        
        // flip state value as it aligns more to what I think of as 'on'
        //   e.g. false means there is a magnet, I actually want true to mean that
        mag.state = !newValue;

        this.logger.log(`${this.logPrefix}[${pin}]: ${mag.location} => ${mag.state}, db => ${mag.db}`)

        // update database to match
        this.ref.child('magnets').child(mag.location).set(mag.state)

        // check for solved state
        this.checkForSolvedState();
    }

    readAllCurrentMagnets() {
        Object.entries(this.magnets).forEach(([pin, mag]) => {
            gpio.read(pin, (err, value) => {
                if (err) throw err;
    
                if (mag.state != !value) {
                    this.magnetStateChanged(pin, value);
                }
            });
        });       
    }

    reset() {
        Object.entries(this.magnets).forEach(([pin, mag]) => {
            mag.state = false;
        });
        this.solved = false;

        this.readAllCurrentMagnets();
    }

    checkForSolvedState() {
        let allSolved = true;

        Object.entries(this.magnets).forEach(([pin, mag]) => {
            allSolved &= mag.state;
        });

        // much more terse way to represent this, but prefer clarity
        if (this.solved && !allSolved) {
            this.solved = false;
            this.ref.update({ solved: false });
            this.emit('unsolved');
        }
        
        if (!this.solved && allSolved) {
            this.solved = true;
            this.ref.update({ solved: true });
            this.emit('solved');
        }
    }
}