module.exports = class Runs {
    constructor(opts) {
        this.runsRef = opts.db.ref('museum/runs')
        this.run = undefined
        this.logger = opts.logger
        this.logPrefix =  'run: '

        opts.db.ref('museum/runs').orderByChild('timestamp').limitToLast(2000).on('value', (snapshot) => {
            let latest = undefined;
            snapshot.forEach(function(runSnap) {
                let run = runSnap.val()
                let key = runSnap.key
                if (run.finished == "") {
                    latest = key
                }
            })

            if (latest) {
                this.logger.log(this.logPrefix + `using ${latest} for run analytics.`)
                this.run = opts.db.ref('museum/runs').child(latest)
            } else {
                this.run = undefined
            }
        })
    }

    cabinetSolved(forced) {
        if (this.run) {
            this.run.child("events/cabinet").update({
                timestamp: (new Date()).toLocaleString(),
                force: forced ? true : false
            })
        } else {
            this.logger.log(this.logPrefix + 'WARN: cabinet: run not defined, not updating analytics')
        }
    }
}