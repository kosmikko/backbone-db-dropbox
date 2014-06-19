var dropbox = new (require("dropbox-mock"))();
var Promises = require('backbone-promises');
var Model = Promises.Model;
var Collection = Promises.Collection;
var Db = require('..');

dropbox.allowAppKey('abc123');
var client = new dropbox.Client({key: 'abc123'});
client.authenticate({interactive: false});

var TestModel = Model.extend({
  type: 'test',
  url: function() {
    return this.type + 's';
  },
  sync: Db.sync
});

var TestCollection = Collection.extend({
  url: function() {
    return 'tests';
  },
  model: Model,
  sync: Db.sync
});

exports.setupDb = function(cb) {
  var db = new Db('dropboxdb-test', client);
  TestModel.prototype.db = db;
  TestCollection.prototype.db = db;
  this.Model = TestModel;
  this.db = db;
  this.dropbox = dropbox;
  this.Collection = TestCollection;
  cb.call(this);
};

exports.clearDb = function(cb) {
  cb();
};