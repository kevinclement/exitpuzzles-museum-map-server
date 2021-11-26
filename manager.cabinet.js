let Manager = require('./manager')

module.exports = class CabinetManager extends Manager {
    constructor(opts) {
        let incoming = [];
        let handlers = {};

        let ref = opts.fb.db.ref('museum/devices/cabinet')

        super({ 
            ...opts,
            ref: ref,
            dev:'/dev/ttyPED',
            baudRate: 115200,
            handlers: handlers,
            incoming:incoming,
        })
        this.run = opts.run
        this.forced = false

        // ask for status once we connect
        this.on('connected', () => {
            this.write('status')
        });

        // setup supported commands
        handlers['cabinet.open'] = (s,cb) => {
            this.forced = true
            this.write('solve', err => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }

        handlers['cabinet.ping'] = (s,cb) => {
            // not sure if this needs to be a ping<PONG type interaction.  for now just send a status
            // command and make sure it doesn't produce a write error.  need to get a repro to see if that
            // can trap it.
            this.write('status', err => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }

        handlers['cabinet.reboot'] = (s,cb) => {
            this.forced = false
            this.write('reboot', err => {
                if (err) {
                    s.ref.update({ 'error': err });
                }
                cb()
            });
        }

        // setup supported device output parsing
        incoming.push(
         {
            pattern:/.*status=(.*)/,
            match: (m) => {
                m[1].split(',').forEach((s)=> {
                    let p = s.split(/:(.+)/);
                    switch(p[0]) {
                        case "version": 
                            this.version = p[1]
                            break
                        case "gitDate": 
                            this.gitDate = p[1]
                            break 
                        case "buildDate": 
                            this.buildDate = p[1]
                            break

                        case "solved": 
                            let _solved = (p[1] === 'true')
                            if (_solved && !this.solved) {
                                this.run.cabinetSolved(this.forced)
                            }
                            this.solved = _solved
                            break
                        case "lights": 
                            this.lights = (p[1] === 'true')
                            break
                        case "magnet": 
                            this.magnet = (p[1] === 'true')
                            break    
                        case "idol": 
                            this.idol = parseInt(p[1]);
                            break
                    }
                })

                ref.child('info/build').update({
                    version: this.version,
                    date: this.buildDate,
                    gitDate: this.gitDate
                })

                ref.update({
                    solved: this.solved,
                    lights: this.lights,
                    magnet: this.magnet,
                    idol: this.idol
                })
            }
        });

        this.db = opts.fb.db
        this.logger = opts.logger

        this.version = "unknown"
        this.gitDate = "unknown"
        this.buildDate = "unknown"

        this.solved = false
        this.lights = false
        this.magnet = false
        this.idol = 0

        // now connect to serial
        this.connect()
    }
}