module.exports = class Runs {
    constructor(opts) {
        this.runsRef = opts.db.ref('museum/runs')
        this.run = undefined
        this.runTime = undefined;
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

            if (latest && latest != this.runTime) {
                this.logger.log(this.logPrefix + `using ${latest} for run analytics.`)
                this.run = opts.db.ref('museum/runs').child(latest)
                this.runTime = latest;
            } else {
                this.run = undefined;
                this.runTime = undefined;
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

    mapSolved(forced) {
        if (!this.run) {
            this.logger.log(this.logPrefix + 'WARN: map: run not defined, not updating analytics')
            return;
        } 

        this.run.child("events/map").update({
            timestamp: (new Date()).toLocaleString(),
            force: forced ? true : false
        })
    }
}