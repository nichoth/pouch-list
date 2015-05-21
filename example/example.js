var Pouch = require('pouchdb');

var db;
var errHandler = console.log.bind(console);

require('little-pouch-db')( new Pouch('pouch-test') )
  .then(function(pouch) {
    db = pouch;

    return db.allDocs({
      include_docs: true,
      startkey: 'a',  // exclude design docs
      endkey: 'z',
      limit: 100
    }).catch(errHandler);

  })
  .then(function(resp) {
    var listen = listenTo.bind(this, db);
    listen('field', console.log.bind(console, 'field '));
    listen('value', console.log.bind(console, 'value '));
    listen('node', console.log.bind(console, 'node '));
    var docs = resp.rows.map(function(row) {
      return row.doc;
    });
    setInterval(updateRandomDoc.bind(this, docs), 1000);
  })
;

function listenTo(db, type, fn) {
  var opts = {
    since: 'now',
    live: true,
    include_docs: true,
    filter: function(doc) {
      return doc.type === type;
    }
  };
  var changes = db.changes(opts)
    .on('change', function(change) {
      fn(change);
    })
  ;
}

function updateRandomDoc(docs) {
  if (!docs.length) {
    return;
  }
  var randomDoc = docs[Math.floor(Math.random() * docs.length)];
  db.get(randomDoc._id).then(function (doc) {
    if (!doc.updatedCount) {
      doc.updatedCount = 0;
    }
    doc.updatedCount++;
    return db.put(doc);
  }).catch(console.log.bind(console));
}
