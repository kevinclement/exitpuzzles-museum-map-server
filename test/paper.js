let logger = new (require('../logging'))
let fb = new (require('../firebase'))
const Paper = require('../paper/paper');

let paper = new Paper({
    ref: fb.db.ref('museum/devices/map'),
    logger: logger,
})

async function main () {
    await paper.load();
    
    paper.displayLegend();
    //paper.displayCode();
}

main()
  .then()
  .catch(err => console.error(err));


