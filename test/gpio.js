// var gpio = require('rpi-gpio');

let fb = new (require('./firebase'))
let logger = new (require('./logging'))

let mc = new (require('./magnetController'))({ logger: logger, ref: fb.db.ref('museum/devices/map') })

mc.on('solved', () => {
    console.log(`solved: ${mc.solved}`)
})

mc.on('unsolved', () => {
    console.log(`unsolved: ${mc.solved}`)
})