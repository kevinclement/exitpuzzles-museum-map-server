let logger = new (require('../logging'))
let audio = new (require('../audio'))({ logger: logger })

audio.play('sharpwin_combo.wav')