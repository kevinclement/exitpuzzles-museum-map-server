var gpio = require('rpi-gpio');

module.exports = class Magnet {
    constructor(pin, location) {
        this.pin = pin;
        this.location = location;
        this.state = false;
        this.db = false;
    }
}