const EventEmitter = require('events');

module.exports = class Manager extends EventEmitter {
    constructor(opts) {
        super()
        this.logger = opts.logger
        this.ref = opts.fb.db.ref('museum/devices/map')
        this.run = opts.run

        this.name = "map"
        this.logPrefix = 'handler: ' + this.name + ': '
        this.created = (new Date()).getTime()
        this.handlers = {};

        // setup supported commands
        this.handlers['map.kkopen'] = (s,cb) => {
            console.log('inside kkopen...')
            cb()


            // this.forced = true
            // this.write('solve', err => {
            //     if (err) {
            //         s.ref.update({ 'error': err });
            //     }
            //     cb()
            // });
        }
    }

    handle(snapshot) {

        // only push operations that can be handled by this manager
        Object.keys(this.handlers).forEach((hp) => {
            if (snapshot.val().command == hp) {
                let op = snapshot.val()

                // if the operation was in the db before we started, clear it out
                if (op.created < this.created) {
                    let now = (new Date()).toString()
                    this.logger.log(this.logPrefix + 'canceling older op \'' + op.command + '\'.')
                    snapshot.ref.update({ 'completed': now, 'canceled': now })
                    return
                }

                this.logger.log(this.logPrefix + 'handling ' + op.command + ' ...')

                // mark it received since all handlers would need to do it
                snapshot.ref.update({ 'received': (new Date()).toString() });

                this.handlers[hp](snapshot, () => {
                    this.ref.child('info').update({
                        lastActivity: (new Date()).toLocaleString()
                    })
                    snapshot.ref.update({ 'completed': (new Date()).toString() });
                })

            }
        })
    }
}