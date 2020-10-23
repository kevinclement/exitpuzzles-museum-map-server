let logger = new (require('../logging'))
let audio = new (require('../audio'))({ logger: logger })

audio.play('sharpwin_combo.wav')
// this.audio.play(fName, (err) => {
//     if (cb) {
//         cb()
//     }
// })