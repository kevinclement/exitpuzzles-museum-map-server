// var gpio = require('rpi-gpio');

let fb = new (require('./firebase'))
let logger = new (require('./logging'))

let mc = new (require('./magnetController'))({ logger: logger, ref: fb.db.ref('museum/devices/map') })
