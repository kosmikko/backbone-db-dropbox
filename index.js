var _ = require('lodash');
var debug = require('debug')('backbone-db-dropbox');
var Db = require('backbone-db');

function DropboxDb(name, client) {
  if (!client) {
    throw new Error('Dropbox client must be provided');
  }
  this.name = name || '';
  this.client = client;
  this.prefixSeparator = '::';
}

DropboxDb.sync = Db.sync;

_.extend(DropboxDb.prototype, Db.prototype, {
  create: function(model, options, callback) {
    this.getTable(model.url(), function(err, table) {
      if (err) return callback(err);
      var record = table.insert(model.toJSON());
      model.set(model.idAttribute, record.id);
      callback(null, model.toJSON());
    });
  },

  find: function(model, options, callback) {
    this.getRecord(model, function(err, record) {
      callback(err, record && record.data);
    });
  },

  findAll: function(model, options, callback) {
    options = options || {};
    if (!model.model && !options.where) {
      debug('fetch model');
    } else {
      debug('fetch collection');
      var queryParams = options.where || {};
      this.getTable(model.url(), function(err, table) {
        var records = table.query(queryParams);
        callback(err, _.pluck(records, 'data'));
      });
    }
  },

  update: function(model, options, callback) {
    var self = this;
    if (model.isNew()) {
      return this.create(model, options, callback);
    }

    this.getRecord(model, function(err, record) {
      if (!record) {
        return self.create(model, options, callback);
      } else {
        record.update(model.toJSON());
      }
      callback(err, model.toJSON());
    });
  },

  destroy: function(model, options, callback) {
    this.getRecord(model, function(err, record) {
      record.deleteRecord();
      callback(null, model.toJSON());
    });
  },

  getRecord: function(model, callback) {
    this.getTable(model.url(), function(err, table) {
      if (err) return callback(err);
      var record = table.get(model.id);
      callback(null, record);
    });
  },

  getTable: function(tableId, callback) {
    this.getDatastore(function(err, datastore) {
      if (err) return callback(err);
      var table = datastore.getTable(tableId);
      return callback(null, table);
    });
  },

  getDatastore: function(callback) {
    var self = this;
    if (this.datastore) return callback(null, this.datastore);
    this
      .getDatastoreManager()
      .openDefaultDatastore(function(err, datastore) {
        self.datastore = datastore;
        callback(err, datastore);
      });
  },

  getDatastoreManager: function() {
    return this.client.getDatastoreManager();
  },

  recordToJson: function(record) {
    return _.extend(record.getFields(), {
      id: record.getId()
    });
  }
});

module.exports = DropboxDb;