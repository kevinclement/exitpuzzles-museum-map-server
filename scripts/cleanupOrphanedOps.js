// This is a helper script to cleanup orphaned ops that never got completed
let fb = new (require('../firebase'))
fs = require('fs')

console.log('Getting orphaned ops from fb...')

fb.db.ref('museum/operations').orderByChild('completed').equalTo(null).on("child_added", function(snapshot) {
    let op = snapshot.val();

    console.log(`removing '${op.command}'...`)
    snapshot.ref.remove();
});