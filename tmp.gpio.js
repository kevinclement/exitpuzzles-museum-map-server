var gpio = require('rpi-gpio');

gpio.setMode(gpio.MODE_BCM);

gpio.on('change', function(channel, value) {
	console.log('Channel ' + channel + ' value is now ' + value);
});
gpio.setup(12, gpio.DIR_IN, gpio.EDGE_BOTH);

// gpio.setup(12, gpio.DIR_IN, readInput);
