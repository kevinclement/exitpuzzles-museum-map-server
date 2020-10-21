let fb = new (require('./firebase'))
let logger = new (require('./logging'))
let run = new (require('./run'))({ logger: logger, db:fb.db })
var paper = require('./paper/paper');

async function main () {
  let managers = [];

  // TODO: confirm on real machine I need this
  // #########################################
  // To be able to build paper binding
  //   sudo apt-get install -y wiringpi
  // #########################################

  // TODO: put back before going live again
  // #######################################

  // managers.push(new (require('./manager.cabinet'))({ name: 'cabinet', logger: logger, fb: fb, run: run }))
  managers.push(new (require('./manager.map'))({ logger: logger, fb: fb, run: run }))

  // might want to turn this off while doing dev, so I have a flag for it
  let ENABLE_FIREBASE_LOGS = true;
  if (ENABLE_FIREBASE_LOGS) {
      logger.enableFirebase(fb.db);
  }

  logger.log('map: Started ExitPuzzles Map server.');

  // track firebase connect and disconnects and log them so we can see how often it happens
  let _connecting = true;
  fb.db.ref('.info/connected').on('value', function(connectedSnap) {
    if (connectedSnap.val() === true) {
      logger.log('map: firebase connected.');
    } else {
      // dont print an error while its still connecting on first start
      if (_connecting) {
        _connecting = false;
      } else {
        logger.log('map: firebase dropped connection!');
      }
    }
  });

  // listen for control operations in the db, filter only ops not completed
  fb.db.ref('museum/operations').orderByChild('completed').equalTo(null).on("child_added", function(snapshot) {
      logger.log('map: received op ' + snapshot.val().command);

      managers.forEach((m) => {
          m.handle(snapshot);
      });
   });

  // update started time and set a ping timer
  // TODO: was pedestal, do I need both?  what else do I have to fix from changing this?
  fb.db.ref('museum/status/map').update({
      started: (new Date()).toLocaleString(),
      ping: (new Date()).toLocaleString()
  })

  // heartbeat timer
  setInterval(()  => {
      fb.db.ref('museum/status/map').update({
        ping: (new Date()).toLocaleString()
      })
  }, 30000)

  // TODO: TMP
  // await paper.load();
  // paper.displayCode();
}

// start main process
main()
  .then()
  .catch(err => console.error(err));